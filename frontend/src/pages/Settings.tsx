import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ChevronRight } from "lucide-react";
import { apiUrl } from "@/api";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [rsshubInstance, setRsshubInstance] = useState("");
  const [fetchInterval, setFetchInterval] = useState("300");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(apiUrl("/api/settings"))
      .then((r) => r.json())
      .then((data) => {
        setRsshubInstance(String(data.rsshub_instance || "https://rsshub.app").replace(/^"|"$/g, ""));
        setFetchInterval(String(data.fetch_interval_default || 300).replace(/^"|"$/g, ""));
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch(apiUrl("/api/settings"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rsshub_instance: rsshubInstance,
        fetch_interval_default: fetchInterval,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/")}
            className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-hover-bg transition-colors"
            aria-label="返回"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold">设置</h1>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">RSSHub 配置</h2>
            <div className="space-y-4 p-4 border border-border rounded-lg">
              <div>
                <label htmlFor="rsshub-url" className="block text-sm font-medium mb-1.5">RSSHub 实例地址</label>
                <input
                  id="rsshub-url"
                  type="url"
                  value={rsshubInstance}
                  onChange={(e) => setRsshubInstance(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm transition-colors focus:border-accent"
                  placeholder="https://rsshub.app"
                />
              </div>
              <div>
                <label htmlFor="fetch-interval" className="block text-sm font-medium mb-1.5">默认抓取间隔（秒）</label>
                <input
                  id="fetch-interval"
                  type="number"
                  value={fetchInterval}
                  onChange={(e) => setFetchInterval(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm transition-colors focus:border-accent"
                  min="60"
                />
                <p className="text-xs text-muted mt-1.5">最小 60 秒，建议 300 秒（5 分钟）</p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-md text-sm hover:bg-accent-hover active:opacity-90 transition-colors disabled:opacity-50"
              >
                {saving ? "保存中..." : saved ? "已保存" : <><Save size={14} /> 保存</>}
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">管理</h2>
            <div className="space-y-2">
              <Link
                to="/settings/feeds"
                className="flex items-center justify-between px-4 py-3 border border-border rounded-lg hover:bg-hover-bg active:bg-selected-bg transition-colors text-sm group"
              >
                <span>订阅源管理</span>
                <ChevronRight size={16} className="text-muted group-hover:text-foreground transition-colors" />
              </Link>
              <Link
                to="/settings/import"
                className="flex items-center justify-between px-4 py-3 border border-border rounded-lg hover:bg-hover-bg active:bg-selected-bg transition-colors text-sm group"
              >
                <span>OPML 导入</span>
                <ChevronRight size={16} className="text-muted group-hover:text-foreground transition-colors" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
