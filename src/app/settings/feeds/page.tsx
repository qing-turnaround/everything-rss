"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFeeds, Feed, Category } from "@/hooks/use-feeds";

export default function FeedsManagePage() {
  const router = useRouter();
  const { feeds, categories, refetch } = useFeeds();
  const [showForm, setShowForm] = useState(false);
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    feedUrl: "",
    siteUrl: "",
    viewType: "article" as "article" | "social" | "video",
    categoryId: "",
    rsshubRoute: "",
  });
  const [newCategoryName, setNewCategoryName] = useState("");

  const resetForm = () => {
    setFormData({ title: "", feedUrl: "", siteUrl: "", viewType: "article", categoryId: "", rsshubRoute: "" });
    setEditingFeed(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      categoryId: formData.categoryId || null,
      rsshubRoute: formData.rsshubRoute || null,
      siteUrl: formData.siteUrl || null,
    };

    if (editingFeed) {
      await fetch(`/api/feeds/${editingFeed.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    refetch();
  };

  const handleEdit = (feed: Feed) => {
    setFormData({
      title: feed.title,
      feedUrl: feed.feedUrl,
      siteUrl: feed.siteUrl || "",
      viewType: feed.viewType,
      categoryId: feed.categoryId || "",
      rsshubRoute: feed.rsshubRoute || "",
    });
    setEditingFeed(feed);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确认删除此订阅源？")) return;
    await fetch(`/api/feeds/${id}`, { method: "DELETE" });
    refetch();
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim() }),
    });
    setNewCategoryName("");
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push("/settings")} className="text-muted hover:text-foreground transition-colors">
            ← 返回
          </button>
          <h1 className="text-xl font-bold">订阅源管理</h1>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-accent text-white rounded-md text-sm hover:bg-accent-hover transition-colors"
          >
            + 添加订阅源
          </button>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="新分类名..."
            className="px-3 py-2 border border-border rounded-md bg-background text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
          />
          <button
            onClick={handleAddCategory}
            className="px-3 py-2 border border-border rounded-md text-sm hover:bg-hover-bg transition-colors"
          >
            添加分类
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border border-border rounded-lg space-y-3">
            <h3 className="font-semibold text-sm">{editingFeed ? "编辑订阅源" : "添加订阅源"}</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="标题 *"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                required
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              />
              <input
                type="url"
                placeholder="RSS URL *"
                value={formData.feedUrl}
                onChange={(e) => setFormData((p) => ({ ...p, feedUrl: e.target.value }))}
                required
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              />
              <input
                type="url"
                placeholder="网站 URL"
                value={formData.siteUrl}
                onChange={(e) => setFormData((p) => ({ ...p, siteUrl: e.target.value }))}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              />
              <input
                type="text"
                placeholder="RSSHub 路由 (如 /twitter/user/xxx)"
                value={formData.rsshubRoute}
                onChange={(e) => setFormData((p) => ({ ...p, rsshubRoute: e.target.value }))}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              />
              <select
                value={formData.viewType}
                onChange={(e) => setFormData((p) => ({ ...p, viewType: e.target.value as "article" | "social" | "video" }))}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="article">文章</option>
                <option value="social">社交媒体</option>
                <option value="video">视频</option>
              </select>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="">无分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-accent text-white rounded-md text-sm hover:bg-accent-hover">
                {editingFeed ? "保存" : "添加"}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-border rounded-md text-sm hover:bg-hover-bg">
                取消
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {feeds.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center">暂无订阅源，点击上方按钮添加</p>
          ) : (
            feeds.map((feed) => (
              <div key={feed.id} className="flex items-center justify-between px-4 py-3 border border-border rounded-md">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{feed.title}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-hover-bg rounded text-muted">
                      {feed.viewType === "article" ? "文章" : feed.viewType === "social" ? "社交" : "视频"}
                    </span>
                    {feed.errorCount > 0 && (
                      <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">
                        错误 ×{feed.errorCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted truncate mt-0.5">{feed.feedUrl}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => handleEdit(feed)} className="text-xs text-accent hover:text-accent-hover">编辑</button>
                  <button onClick={() => handleDelete(feed.id)} className="text-xs text-red-500 hover:text-red-600">删除</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
