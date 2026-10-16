import React, { useEffect, useState } from "react";

export default function RepositoryPage({ courseId }: { courseId?: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetCourseId, setTargetCourseId] = useState(courseId || "");

  const fetchItems = () => {
    setLoading(true);
    const q = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
    fetch(`/api/repository/list${q}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, [courseId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file to upload.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);
    formData.append("description", description);
    if (targetCourseId) formData.append("courseId", targetCourseId);

    setUploading(true);
    try {
      const res = await fetch("/api/repository/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        alert("File uploaded successfully!");
        setShowUploadModal(false);
        setFile(null);
        setTitle("");
        setDescription("");
        fetchItems();
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      alert("Network error during upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Repository & Materials</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow text-sm font-semibold transition"
        >
          + Upload Material
        </button>
      </div>

      {loading && <div className="text-gray-500">Loading repository…</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((it) => (
          <div key={it.id} className="border rounded-lg p-4 shadow-sm bg-white flex flex-col justify-between">
            <div>
              <div className="w-full h-28 flex items-center justify-center bg-gray-50 rounded mb-3">
                <svg className="w-12 h-12 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path strokeWidth="2" d="M14 2v6h6" />
                </svg>
              </div>
              <div className="font-semibold text-sm text-gray-800 truncate" title={it.title || it.originalName}>
                {it.title || it.originalName}
              </div>
              {it.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{it.description}</p>}
            </div>

            <div className="mt-4 pt-3 border-t flex items-center justify-between">
              <span className="text-xs text-gray-400">{Math.round((it.size || 0) / 1024)} KB</span>
              <a
                href={`/api/repository/${it.id}/download`}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="mt-6 text-gray-500 text-center py-12 bg-gray-50 rounded border border-dashed">
          No files uploaded yet.
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Upload Material</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File (Max 20MB)</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Optional display title"
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course ID (Optional)</label>
                <input
                  type="text"
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  placeholder="Leave blank for public repository material"
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50 transition"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}