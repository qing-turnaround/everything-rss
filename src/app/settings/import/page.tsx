"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/import/opml", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Import failed");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("导入失败，请检查文件格式");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push("/settings")} className="text-muted hover:text-foreground transition-colors">
            ← 返回
          </button>
          <h1 className="text-xl font-bold">OPML 导入</h1>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted">
            上传 OPML 文件以批量导入订阅源。大多数 RSS 阅读器都支持导出 OPML 格式。
          </p>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".opml,.xml"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-4"
            />
            {file && (
              <p className="text-sm text-muted mb-4">已选择: {file.name}</p>
            )}
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="px-4 py-2 bg-accent text-white rounded-md text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {loading ? "导入中..." : "开始导入"}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>
          )}

          {result && (
            <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
              导入完成：成功 {result.imported} 个，跳过 {result.skipped} 个
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
