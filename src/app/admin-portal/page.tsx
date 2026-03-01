"use client";

import { useState, FormEvent, useEffect } from "react";
import { verifyAdmin, addNewsItem, addLearningItem, getNews, getLearning, deleteNewsItem, deleteLearningItem, getLearningItem } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, LogIn, Trash2, Sparkles, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [learningCategory, setLearningCategory] = useState("使用教程"); // Default category
  const [learningContent, setLearningContent] = useState("");
  const [learningList, setLearningList] = useState<any[]>([]);

  // Smart Tool Form State
  const [toolUrl, setToolUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [toolData, setToolData] = useState({
    name: "",
    category: "Chat",
    description: "",
    icon: "🤖",
    url: "",
    isHot: false
  });
  const [publishLoading, setPublishLoading] = useState(false);
  const [descGenerating, setDescGenerating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const news = await getNews();
      if (Array.isArray(news)) {
        setNewsList(news);
      } else {
        console.error("News data is not an array:", news);
        setNewsList([]);
      }
      
      const learning = await getLearning();
      if (Array.isArray(learning)) {
        setLearningList(learning);
      } else {
        console.error("Learning data is not an array:", learning);
        setLearningList([]);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      alert("加载数据失败，请检查网络或刷新页面");
    }
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

  const handleGenerateNews = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-news", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.error) {
        alert("AI 生成失败: " + data.error);
      } else {
        setNewsTitle(data.title);
        setNewsSummary(data.summary);
        setNewsCategory(data.category);
        setNewsDate(new Date().toISOString().split('T')[0]); // Set today's date
      }
    } catch (error) {
      console.error("Failed to generate news:", error);
      alert("AI 生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (id: number | string) => {
    if (confirm("确认删除这条资讯吗？")) {
      setLoading(true);
      const result = await deleteNewsItem(id);
      setLoading(false);
      if (result.success) {
        alert("删除成功");
        fetchData();
      } else {
        alert("删除失败：" + result.error);
      }
    }
  };

  const handleEditNews = (item: any) => {
    setNewsTitle(item.title);
    setNewsSummary(item.summary);
    setNewsDate(item.date);
    setNewsCategory(item.category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditLearning = async (item: any) => {
    setLoading(true);
    try {
      // Fetch full details including content
      const fullItem = await getLearningItem(item.id);
      if (fullItem) {
        setLearningTitle(fullItem.title);
        setLearningDesc(fullItem.desc);
        setLearningCategory(fullItem.category);
        
        // Handle content format (string or object)
        let content = fullItem.content;
        try {
          // Check if content is JSON string
          if (content && content.trim().startsWith('{')) {
            const parsed = JSON.parse(content);
            content = parsed.text || content;
          }
        } catch (e) {
          // Not JSON, use as is
        }
        setLearningContent(content);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error("Failed to fetch learning details:", error);
      alert("获取详情失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLearning = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newItem = {
      title: learningTitle,
      desc: learningDesc,
      icon: "Sparkles", // Default icon
      category: learningCategory,
      content: learningContent
    };

    const result = await addLearningItem(newItem);
    setLoading(false);

    if (result.success) {
      alert("AI 学习内容发布成功！");
      setLearningTitle("");
      setLearningDesc("");
      setLearningCategory("使用教程");
      setLearningContent("");
      fetchData();
    } else {
      alert("发布失败：" + result.error);
    }
  };

  const handleDeleteLearning = async (id: number | string) => {
    if (confirm("确认删除这条学习资源吗？")) {
      setLoading(true);
      const result = await deleteLearningItem(id);
      setLoading(false);
      if (result.success) {
        alert("删除成功");
        fetchData();
      } else {
        alert("删除失败：" + result.error);
      }
    }
  };

  const handleTestZhipu = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/zhipu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: '你好，我是 Multipost AI 的领航员',
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      alert(`智谱回复：\n${data.content}`);
    } catch (err: any) {
      console.error(err);
      alert(`测试失败：${err.message}`);
    } finally {
      setLoading(false);
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

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    if (!toolUrl.trim()) return;

    setAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: toolUrl })
      });

      if (!response.ok) throw new Error('Failed to analyze URL');

      const data = await response.json();
      setToolData({
        ...toolData,
        name: data.name || "",
        category: data.category || "Other",
        description: data.description || "",
        icon: data.icon || "🔧",
        url: toolUrl // Keep original URL
      });
      alert("AI 智能分析完成！");
    } catch (err) {
      console.error(err);
      alert("分析失败，请手动填写或重试");
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePublishTool = async () => {
    setPublishLoading(true);
    try {
      const response = await fetch('/api/tools/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolData)
      });

      if (!response.ok) throw new Error('Failed to create tool');

      alert("工具已一键入库发布成功！");
      setToolUrl("");
      setToolData({
        name: "",
        category: "Chat",
        description: "",
        icon: "🤖",
        url: "",
        isHot: false
      });
    } catch (err) {
      console.error(err);
      alert("发布失败，请重试");
    } finally {
      setPublishLoading(false);
    }
  };

  const handleGenerateDesc = async () => {
    if (!toolData.name) return;
    
    setDescGenerating(true);
    try {
      const response = await fetch('/api/zhipu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: toolData.name,
          type: 'generate_description'
        })
      });

      if (!response.ok) throw new Error('Failed to generate description');

      const data = await response.json();
      setToolData(prev => ({
        ...prev,
        description: data.description || prev.description,
        category: data.category || prev.category,
        icon: data.icon || prev.icon
      }));
      
      alert("AI 简介生成成功！");
    } catch (err) {
      console.error(err);
      alert("生成失败，请重试");
    } finally {
      setDescGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">后台管理系统</h1>
          <div className="flex gap-4">
            <Button onClick={handleTestZhipu}>智谱测试</Button>
            <Button variant="outline" onClick={() => setIsAuthenticated(false)}>退出登录</Button>
          </div>
        </div>

        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="news">AI 资讯管理</TabsTrigger>
            <TabsTrigger value="learning">AI 学习管理</TabsTrigger>
            <TabsTrigger value="smart-editorial">智能采编</TabsTrigger>
          </TabsList>

          <TabsContent value="smart-editorial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  AI 工具智能采编
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Step 1: URL Input */}
                  <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium">输入 AI 工具官网链接</label>
                      <input
                        className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-800"
                        placeholder="https://..."
                        value={toolUrl}
                        onChange={(e) => setToolUrl(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={analyzing || !toolUrl}
                      className="mb-[1px]"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          分析中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          智能分析
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Step 2: Edit & Publish */}
                  <div className="p-6 border rounded-lg bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800 space-y-6">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Pencil className="h-4 w-4" />
                      采编结果确认
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-500">工具名称</label>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 p-2 border rounded-md bg-white dark:bg-slate-950 dark:border-slate-800"
                            value={toolData.name}
                            onChange={(e) => setToolData({...toolData, name: e.target.value})}
                            placeholder="AI 自动填充..."
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleGenerateDesc}
                            disabled={descGenerating || !toolData.name}
                            title="AI 生成简介和分类"
                            className="shrink-0"
                          >
                            {descGenerating ? (
                              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                            ) : (
                              <Sparkles className="h-4 w-4 text-indigo-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-500">分类</label>
                        <select
                          className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 dark:border-slate-800"
                          value={toolData.category}
                          onChange={(e) => setToolData({...toolData, category: e.target.value})}
                        >
                          <option value="Chat">Chat</option>
                          <option value="Image">Image</option>
                          <option value="Video">Video</option>
                          <option value="Writing">Writing</option>
                          <option value="Audio">Audio</option>
                          <option value="Coding">Coding</option>
                          <option value="Learning">Learning</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-500">图标 (Emoji)</label>
                        <input
                          className="w-full p-2 border rounded-md bg-white dark:bg-slate-900 dark:border-slate-800"
                          value={toolData.icon}
                          onChange={(e) => setToolData({...toolData, icon: e.target.value})}
                          placeholder="🤖"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-8">
                        <input
                          type="checkbox"
                          id="isHot"
                          checked={toolData.isHot}
                          onChange={(e) => setToolData({...toolData, isHot: e.target.checked})}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="isHot" className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                          设为热门工具 (Hot)
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-500">一句话描述</label>
                      <textarea
                        className="w-full p-2 border rounded-md bg-white dark:bg-slate-950 dark:border-slate-800 h-24 resize-none"
                        value={toolData.description}
                        onChange={(e) => setToolData({...toolData, description: e.target.value})}
                        placeholder="AI 自动生成..."
                      />
                    </div>

                    <div className="pt-2">
                      <Button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all" 
                        onClick={handlePublishTool}
                        disabled={publishLoading || !toolData.name}
                        size="lg"
                      >
                        {publishLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            入库中...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-5 w-5" />
                            一键入库发布
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                    <label htmlFor="news-category" className="text-sm font-medium">分类</label>
                    <select
                      id="news-category"
                      value={newsCategory}
                      onChange={(e) => setNewsCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                    >
                      <option value="快讯">快讯</option>
                      <option value="深度">深度</option>
                      <option value="活动">活动</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">文章详情 (Markdown)</label>
                    <textarea
                      className="w-full p-2 border rounded-md h-96 dark:bg-slate-900 dark:border-slate-800 font-mono text-sm"
                      value={newsSummary}
                      onChange={(e) => setNewsSummary(e.target.value)}
                      required
                      placeholder="支持 Markdown 格式..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          发布中...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          发布资讯
                        </>
                      )}
                    </Button>

                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950"
                      onClick={handleGenerateNews}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      AI 自动写稿
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Content List */}
            <Card>
              <CardHeader>
                <CardTitle>已发布资讯列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newsList.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{item.title}</span>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", 
                            item.category === "快讯" ? "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300" :
                            item.category === "深度" ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" :
                            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          )}>
                            {item.category}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          发布于: {item.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditNews(item)}
                          className="text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteNews(item.id)}
                          className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {newsList.length === 0 && (
                    <div className="text-center py-8 text-slate-500">暂无已发布资讯</div>
                  )}
                </div>
              </CardContent>
            </Card>
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
                    <label className="text-sm font-medium">分类</label>
                    <select
                      className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-800"
                      value={learningCategory}
                      onChange={(e) => setLearningCategory(e.target.value)}
                    >
                      <option value="使用教程">使用教程</option>
                      <option value="软件推荐">软件推荐</option>
                      <option value="学习资料">学习资料</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">文章详情 (Markdown)</label>
                    <textarea
                      className="w-full p-2 border rounded-md h-32 dark:bg-slate-900 dark:border-slate-800"
                      value={learningContent}
                      onChange={(e) => setLearningContent(e.target.value)}
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

            {/* Content List */}
            <Card>
              <CardHeader>
                <CardTitle>已发布学习内容列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningList.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{item.title}</span>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", 
                            item.category === "使用教程" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                            item.category === "提示词" ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" :
                            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          )}>
                            {item.category}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          发布于: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '未知'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditLearning(item)}
                          className="text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteLearning(item.id)}
                          className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {learningList.length === 0 && (
                    <div className="text-center py-8 text-slate-500">暂无已发布学习内容</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
