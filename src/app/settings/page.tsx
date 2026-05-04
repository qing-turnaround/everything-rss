"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [rsshubInstance, setRsshubInstance] = useState("");
  const [fetchInterval, setFetchInterval] = useState("300");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setRsshubInstance(String(data.rsshub_instance || "https://rsshub.app"));
        setFetchInterval(String(data.fetch_interval_default || 300));
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rsshub_instance: rsshubInstance,
        fetch_interval_default: parseInt(fetchInterval, 10),
      }),
    });
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push("/")} className="text-muted hover:text-foreground transition-colors">
            ← 返回
          </button>
          <h1 className="text-xl font-bold">设置</h1>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4">RSSHub 配置</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">RSSHub 实例地址</label>
                <input
                  type="url"
                  value={rsshubInstance}
                  onChange={(e) => setRsshubInstance(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                  placeholder="https://rsshub.app"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">默认抓取间隔（秒）</label>
                <input
                  type="number"
                  value={fetchInterval}
                  onChange={(e) => setFetchInterval(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                  min="60"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-accent text-white rounded-md text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">管理</h2>
            <div className="space-y-2">
              <Link
                href="/settings/feeds"
                className="block px-4 py-3 border border-border rounded-md hover:bg-hover-bg transition-colors text-sm"
              >
                订阅源管理 →
              </Link>
              <Link
                href="/settings/import"
                className="block px-4 py-3 border border-border rounded-md hover:bg-hover-bg transition-colors text-sm"
              >
                OPML 导入 →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
