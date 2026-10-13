import React, { useState } from 'react';
import { TrendingUp, Users, DollarSign, Star, Award, BarChart2 } from 'lucide-react';
import { Course, User, Enrollment } from '../types';

interface InstructorAnalyticsProps {
  currentUser: User;
  courses: Course[];
  enrollments: Enrollment[];
}

export default function InstructorAnalytics({ currentUser, courses, enrollments }: InstructorAnalyticsProps) {
  const myCourses = courses.filter(c => c.instructorId === currentUser.id);
  const myEnrollments = enrollments.filter(e => myCourses.find(c => c.id === e.courseId));

  const totalStudents = myCourses.reduce((a, c) => a + c.enrollmentCount, 0);
  const totalRevenue = myCourses.reduce((a, c) => a + c.enrollmentCount * c.price, 0);
  const instructorShare = Math.floor(totalRevenue * 0.7);
  const avgRating = myCourses.length > 0
    ? (myCourses.reduce((a, c) => a + c.ratingAverage, 0) / myCourses.length).toFixed(2)
    : '0.00';
  const completions = myEnrollments.filter(e => e.progress >= 100).length;
  const completionRate = myEnrollments.length > 0 ? Math.round((completions / myEnrollments.length) * 100) : 0;

  const maxEnrollment = Math.max(...myCourses.map(c => c.enrollmentCount), 1);
  const maxRevenue = Math.max(...myCourses.map(c => c.enrollmentCount * c.price), 1);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const growthPoints = [15, 28, 42, 58, 75, 100].map(p => Math.floor((totalStudents * p) / 100));

  const statCards = [
    { label: 'Total Students', value: totalStudents.toLocaleString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Gross Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Your Share (70%)', value: `$${instructorShare.toLocaleString()}`, icon: TrendingUp, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
    { label: 'Avg Rating', value: `${avgRating} ★`, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Completions', value: completions, icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: BarChart2, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  ];

  const svgMax = 100;
  const points = growthPoints.map((v, i) => {
    const x = (i / (growthPoints.length - 1)) * 95 + 2;
    const y = svgMax - (v / Math.max(...growthPoints, 1)) * 85 + 5;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-8 text-left animate-fade-in">
      <div>
        <h3 className="text-sm font-extrabold text-white">Instructor Analytics</h3>
        <p className="text-[10px] text-slate-500 mt-0.5">Performance data across your published courses.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className={`p-5 rounded-2xl border ${card.bg} space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">{card.label}</span>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className={`text-2xl font-extrabold font-mono ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Student Growth Trend</h4>
          <div className="relative h-48 w-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                points={points}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {growthPoints.map((v, i) => {
                const x = (i / (growthPoints.length - 1)) * 95 + 2;
                const y = svgMax - (v / Math.max(...growthPoints, 1)) * 85 + 5;
                return <circle key={i} cx={x} cy={y} r="2" fill="#3b82f6" />;
              })}
              <line x1="2" y1="5" x2="2" y2="97" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              <line x1="2" y1="97" x2="97" y2="97" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
              {months.map((m, i) => <span key={i} className="text-[9px] text-slate-600 font-mono">{m}</span>)}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-card space-y-4">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Enrollments per Course</h4>
          <div className="space-y-3">
            {myCourses.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No courses yet.</p>
            ) : (
              myCourses.map(course => {
                const pct = Math.round((course.enrollmentCount / maxEnrollment) * 100);
                return (
                  <div key={course.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-300 truncate max-w-[70%]">{course.title}</span>
                      <span className="text-xs font-mono text-blue-400 font-bold">{course.enrollmentCount}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl glass-card space-y-4">
        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Revenue Breakdown by Course</h4>
        {myCourses.length === 0 ? (
          <p className="text-xs text-slate-600 italic">No courses published yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="pb-3 pr-4">Course</th>
                  <th className="pb-3 pr-4">Students</th>
                  <th className="pb-3 pr-4">Price</th>
                  <th className="pb-3 pr-4">Gross</th>
                  <th className="pb-3">Your Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {myCourses.map(course => {
                  const gross = course.enrollmentCount * course.price;
                  const share = Math.floor(gross * 0.7);
                  return (
                    <tr key={course.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 text-slate-200 font-medium max-w-[200px] truncate">{course.title}</td>
                      <td className="py-3 pr-4 font-mono text-blue-400">{course.enrollmentCount}</td>
                      <td className="py-3 pr-4 font-mono text-slate-300">${course.price}</td>
                      <td className="py-3 pr-4 font-mono text-slate-300">${gross.toLocaleString()}</td>
                      <td className="py-3 font-mono font-bold text-emerald-400">${share.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10">
                  <td className="pt-3 pr-4 text-xs font-bold text-slate-300">TOTAL</td>
                  <td className="pt-3 pr-4 font-mono font-bold text-blue-400">{totalStudents}</td>
                  <td className="pt-3 pr-4" />
                  <td className="pt-3 pr-4 font-mono font-bold text-slate-200">${totalRevenue.toLocaleString()}</td>
                  <td className="pt-3 font-mono font-bold text-emerald-400">${instructorShare.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl glass-card space-y-4">
        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Student Progress Overview</h4>
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { label: 'Not Started', value: myEnrollments.filter(e => e.progress === 0).length, color: 'text-slate-500' },
            { label: 'In Progress', value: myEnrollments.filter(e => e.progress > 0 && e.progress < 100).length, color: 'text-blue-400' },
            { label: 'Completed', value: completions, color: 'text-emerald-400' },
          ].map((item, idx) => (
            <div key={idx}>
              <div className={`text-3xl font-extrabold font-mono ${item.color}`}>{item.value}</div>
              <div className="text-[10px] text-slate-500 uppercase mt-1">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden flex">
          {myEnrollments.length > 0 && (
            <>
              <div className="h-full bg-slate-600 transition-all" style={{ width: `${Math.round((myEnrollments.filter(e => e.progress === 0).length / myEnrollments.length) * 100)}%` }} />
              <div className="h-full bg-blue-600 transition-all" style={{ width: `${Math.round((myEnrollments.filter(e => e.progress > 0 && e.progress < 100).length / myEnrollments.length) * 100)}%` }} />
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.round((completions / myEnrollments.length) * 100)}%` }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
