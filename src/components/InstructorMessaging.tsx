import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User as UserIcon, ChevronRight, Circle } from 'lucide-react';
import { User } from '../types';

interface InstructorMessagingProps {
  currentUser: User;
  triggerToast: (msg: string, type?: 'success' | 'warn') => void;
}

export default function InstructorMessaging({ currentUser, triggerToast }: InstructorMessagingProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [newTo, setNewTo] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const resp = await fetch(`/api/messages/${currentUser.id}`);
      const data = await resp.json();
      setMessages(data.messages || []);
    } catch {
      triggerToast('Failed to load messages', 'warn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread, messages]);

  const threads = messages.reduce((acc: Record<string, any[]>, msg: any) => {
    const other = msg.fromId === currentUser.id ? msg.toId : msg.fromId;
    const otherName = msg.fromId === currentUser.id ? msg.toName : msg.fromName;
    if (!acc[other]) acc[other] = [];
    acc[other].push(msg);
    return acc;
  }, {});

  const threadKeys = Object.keys(threads).sort((a, b) => {
    const latestA = threads[a][threads[a].length - 1]?.timestamp || '';
    const latestB = threads[b][threads[b].length - 1]?.timestamp || '';
    return latestB.localeCompare(latestA);
  });

  const activeMessages = activeThread ? (threads[activeThread] || []) : [];
  const activeOtherName = activeThread && messages.length > 0
    ? messages.find(m => m.fromId === activeThread || m.toId === activeThread)?.fromId === activeThread
      ? messages.find(m => m.fromId === activeThread)?.fromName
      : messages.find(m => m.toId === activeThread)?.toName
    : '';

  const unreadInThread = (otherId: string) => threads[otherId]?.filter(m => m.toId === currentUser.id && !m.read).length || 0;

  const sendReply = async () => {
    if (!replyText.trim() || !activeThread) return;
    setSending(true);
    try {
      const resp = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromId: currentUser.id,
          fromName: currentUser.name,
          fromRole: currentUser.role,
          toId: activeThread,
          toName: activeOtherName,
          subject: activeMessages[0]?.subject || 'Re: Message',
          body: replyText,
        }),
      });
      const data = await resp.json();
      if (data.status === 'success') {
        setReplyText('');
        await fetchMessages();
      }
    } catch {
      triggerToast('Failed to send message', 'warn');
    } finally {
      setSending(false);
    }
  };

  const sendNew = async () => {
    if (!newTo.trim() || !newBody.trim()) {
      triggerToast('Recipient ID and message body are required.', 'warn');
      return;
    }
    setSending(true);
    try {
      const resp = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromId: currentUser.id,
          fromName: currentUser.name,
          fromRole: currentUser.role,
          toId: newTo,
          toName: newTo,
          subject: newSubject || 'Message from Instructor',
          body: newBody,
        }),
      });
      const data = await resp.json();
      if (data.status === 'success') {
        triggerToast('Message sent!');
        setNewMsgOpen(false);
        setNewTo(''); setNewSubject(''); setNewBody('');
        await fetchMessages();
      }
    } catch {
      triggerToast('Failed to send', 'warn');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="text-left animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-extrabold text-white">Student Messaging</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Communicate with your enrolled students.</p>
        </div>
        <button
          onClick={() => setNewMsgOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold cursor-pointer hover:bg-blue-600/30 transition-colors flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" /> New Message
        </button>
      </div>

      {newMsgOpen && (
        <div className="mb-6 p-5 rounded-2xl glass-card space-y-4 border border-blue-500/20">
          <h4 className="text-xs font-bold text-blue-400 uppercase">Compose Message</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Recipient User ID *</label>
              <input value={newTo} onChange={e => setNewTo(e.target.value)} placeholder="e.g. u_student" className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subject</label>
              <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Course update, feedback..." className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Message *</label>
              <textarea value={newBody} onChange={e => setNewBody(e.target.value)} rows={3} className="w-full text-xs p-2.5 rounded-lg glass-input text-white resize-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={sendNew} disabled={sending} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5">
              <Send className="w-3 h-3" /> Send
            </button>
            <button onClick={() => setNewMsgOpen(false)} className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 text-xs cursor-pointer hover:bg-white/5 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ minHeight: 400 }}>
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-3">Conversations</p>
          {loading ? (
            <div className="text-xs text-slate-600 italic p-4">Loading...</div>
          ) : threadKeys.length === 0 ? (
            <div className="p-8 rounded-2xl glass-card text-center text-slate-600 text-xs italic">No conversations yet.</div>
          ) : (
            threadKeys.map(otherId => {
              const lastMsg = threads[otherId][threads[otherId].length - 1];
              const unread = unreadInThread(otherId);
              const otherName = lastMsg?.fromId === otherId ? lastMsg.fromName : lastMsg?.toName;
              return (
                <div
                  key={otherId}
                  onClick={() => setActiveThread(otherId)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                    activeThread === otherId ? 'bg-blue-600/20 border border-blue-500/30' : 'glass-card hover:border-white/20'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200 truncate">{otherName || otherId}</span>
                      {unread > 0 && <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">{unread}</span>}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{lastMsg?.body?.substring(0, 40)}...</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="md:col-span-2 flex flex-col rounded-2xl glass-card border border-white/10 overflow-hidden" style={{ minHeight: 400 }}>
          {!activeThread ? (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-sm italic">
              Select a conversation to view messages
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-white/5 bg-white/[0.01] flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-sm font-bold text-white">{activeOtherName || activeThread}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 320 }}>
                {activeMessages.map((msg, idx) => {
                  const isMe = msg.fromId === currentUser.id;
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-3 rounded-2xl text-xs ${
                        isMe ? 'bg-blue-600/25 text-blue-100 rounded-tr-sm' : 'bg-white/[0.05] text-slate-200 rounded-tl-sm'
                      }`}>
                        <p className="leading-relaxed">{msg.body}</p>
                        <p className={`text-[9px] mt-1.5 ${isMe ? 'text-blue-300/60' : 'text-slate-600'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t border-white/5 flex gap-2">
                <input
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Type a reply... (Enter to send)"
                  className="flex-1 text-xs p-2.5 rounded-lg glass-input text-white"
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !replyText.trim()}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
