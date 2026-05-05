import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { apiUrl } from "@/api";

export default function ImportPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(apiUrl("/api/import/opml"), {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Import failed");

      const data = await res.json();
      setResult(data);
    } catch {
      setError("导入失败，请检查文件格式");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.name.endsWith(".opml") || dropped.name.endsWith(".xml"))) {
      setFile(dropped);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/settings")}
            className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-hover-bg transition-colors"
            aria-label="返回"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold">OPML 导入</h1>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted">
            上传 OPML 文件以批量导入订阅源。大多数 RSS 阅读器都支持导出 OPML 格式。
          </p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
              dragOver ? "border-accent bg-accent-soft" : "border-border"
            }`}
          >
            <Upload size={28} strokeWidth={1.5} className="mx-auto mb-3 text-muted opacity-50" />
            <p className="text-sm text-muted mb-4">
              拖拽文件到此处，或点击下方选择
            </p>
            <input
              type="file"
              accept=".opml,.xml"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm"
              id="opml-file"
            />
            {file && (
              <p className="text-sm text-foreground mt-3">已选择: {file.name}</p>
            )}
            <div className="mt-4">
              <button
                onClick={handleImport}
                disabled={!file || loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-md text-sm hover:bg-accent-hover active:opacity-90 transition-colors disabled:opacity-50"
              >
                {loading ? "导入中..." : "开始导入"}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-danger-soft text-danger rounded-lg text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <div className="flex items-center gap-2 p-3 bg-success-soft text-success rounded-lg text-sm">
              <CheckCircle size={16} className="flex-shrink-0" />
              导入完成：成功 {result.imported} 个，跳过 {result.skipped} 个
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
