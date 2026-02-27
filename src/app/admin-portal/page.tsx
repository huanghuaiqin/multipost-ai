"use client";

import { useState, FormEvent, useEffect } from "react";
import { verifyAdmin, addNewsItem, addLearningItem, getNews, getLearning, deleteNewsItem, deleteLearningItem } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, LogIn, Trash2 } from "lucide-react";

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // News Form State
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSummary, setNewsSummary] = useState("");
  const [newsDate, setNewsDate] = useState("刚刚");
  const [newsCategory, setNewsCategory] = useState("快讯");
  const [newsList, setNewsList] = useState<any[]>([]);

  // Learning Form State
  const [learningTitle, setLearningTitle] = useState("");
  const [learningDesc, setLearningDesc] = useState("");
  const [learningContentTitle, setLearningContentTitle] = useState("");
  const [learningContentText, setLearningContentText] = useState("");
  const [learningList, setLearningList] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    const news = await getNews();
    setNewsList(news);
    const learning = await getLearning();
    setLearningList(learning);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const isValid = await verifyAdmin(password);
      if (isValid) {
        setIsAuthenticated(true);
      } else {
        setError("密码错误");
      }
    } catch (err) {
      setError("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNews = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newItem = {
      title: newsTitle,
      summary: newsSummary,
      date: newsDate,
      category: newsCategory,
      // Default styles for simplicity
      categoryColor: "text-sky-600 bg-sky-50 border-sky-100",
      icon: "TrendingUp",
      iconColor: "text-sky-500",
      imageColor: "bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-950 dark:to-slate-900"
    };

    const result = await addNewsItem(newItem);
    setLoading(false);

    if (result.success) {
      alert("AI 资讯发布成功！");
      setNewsTitle("");
      setNewsSummary("");
      fetchData();
    } else {
      alert("发布失败：" + result.error);
    }
  };

  const handleDeleteNews = async (id: number | string) => {
    if (confirm("确认删除这条资讯吗？")) {
        const result = await deleteNewsItem(id);
        if (result.success) {
            fetchData();
        } else {
            alert("删除失败");
        }
    }
  };

  const handleAddLearning = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newItem = {
      title: learningTitle,
      desc: learningDesc,
      icon: "Sparkles", // Default icon
      content: {
        title: learningContentTitle,
        text: learningContentText,
      }
    };

    const result = await addLearningItem(newItem);
    setLoading(false);

    if (result.success) {
      alert("AI 学习内容发布成功！");
      setLearningTitle("");
      setLearningDesc("");
      setLearningContentTitle("");
      setLearningContentText("");
      fetchData();
    } else {
      alert("发布失败：" + result.error);
    }
  };

  const handleDeleteLearning = async (id: string) => {
    if (confirm("确认删除这条学习内容吗？")) {
        const result = await deleteLearningItem(id);
        if (result.success) {
            fetchData();
        } else {
            alert("删除失败");
        }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">后台管理登录</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="请输入管理员密码"
                  className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                登录
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">后台管理系统</h1>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>退出登录</Button>
        </div>

        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="news">AI 资讯管理</TabsTrigger>
            <TabsTrigger value="learning">AI 学习管理</TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>发布新资讯</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddNews} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">标题</label>
                      <input
                        className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-800"
                        value={newsTitle}
                        onChange={(e) => setNewsTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">日期</label>
                      <input
                        className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-800"
                        value={newsDate}
                        onChange={(e) => setNewsDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">分类</label>
                    <select
                      className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-800"
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value)}
                    >
                      <option value="快讯">快讯</option>
                      <option value="重磅">重磅</option>
                      <option value="行业">行业</option>
                      <option value="产品">产品</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">摘要</label>
                    <textarea
                      className="w-full p-2 border rounded-md h-24 dark:bg-slate-900 dark:border-slate-800"
                      value={newsSummary}
                      onChange={(e) => setNewsSummary(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    发布资讯
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-bold">已发布资讯 ({newsList.length})</h2>
                {newsList.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                        <div className="p-4 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold">{item.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">{item.date} · {item.category}</p>
                                <p className="text-sm mt-2 line-clamp-2">{item.summary}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteNews(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="learning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>发布学习卡片</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddLearning} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">卡片标题</label>
                    <input
                      className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-800"
                      value={learningTitle}
                      onChange={(e) => setLearningTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">简短描述</label>
                    <input
                      className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-800"
                      value={learningDesc}
                      onChange={(e) => setLearningDesc(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">详情页标题</label>
                    <input
                      className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-800"
                      value={learningContentTitle}
                      onChange={(e) => setLearningContentTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">详情页内容 (Markdown)</label>
                    <textarea
                      className="w-full p-2 border rounded-md h-32 dark:bg-slate-900 dark:border-slate-800"
                      value={learningContentText}
                      onChange={(e) => setLearningContentText(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    发布卡片
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-bold">已发布学习内容 ({learningList.length})</h2>
                {learningList.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                        <div className="p-4 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold">{item.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteLearning(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
