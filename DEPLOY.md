# Multipost AI 部署指南

本项目是一个基于 Next.js 的内容管理系统，使用本地文件系统 (`data/db.json`) 存储数据。
**重要提示**：由于依赖本地文件写入，本项目 **不适合** 直接部署在 Vercel、Netlify 等 Serverless 平台（数据重启后会丢失）。

建议使用 **云服务器 (VPS)** 或 **Docker** 进行部署。

## 方式三：Vercel 部署 (推荐 Serverless)

如果您希望使用 Vercel 进行免费部署，本项目已支持 **Vercel Postgres** 数据库，无需担心数据丢失问题。

### 1. 准备工作
- 注册 [Vercel](https://vercel.com/) 账号。
- 安装 Vercel CLI：`npm install -g vercel`

### 2. 创建数据库
1. 在 Vercel 控制台创建一个新项目。
2. 进入项目 Storage 选项卡，点击 "Create Database" -> "Postgres"。
3. 创建完成后，在设置中找到 `.env.local` 选项卡，复制所有环境变量。

### 3. 配置环境变量
在本地或 Vercel 项目设置中，添加以下环境变量：
```bash
# 启用 Postgres 模式
USE_POSTGRES=true

# Postgres 连接信息 (从 Vercel 获取)
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...

# DeepSeek API (可选)
DEEPSEEK_API_KEY=sk-xxxx
```

### 4. 部署
在项目根目录运行：
```bash
vercel
```
或者将代码推送到 GitHub，并在 Vercel 中导入仓库进行自动部署。

---

## 方式一：Docker 容器部署（私有化部署推荐）

这是最稳定、最简单的部署方式，只需服务器安装 Docker 即可。

### 1. 准备环境
确保服务器已安装 Docker 和 Docker Compose。

### 2. 部署步骤
将整个项目代码上传到服务器（或通过 git clone），然后在项目根目录下运行：

```bash
# 后台构建并启动服务
docker-compose up -d --build
```

### 3. 数据管理与备份
- **数据位置**：所有数据存储在 `data/db.json` 文件中。
- **持久化**：`docker-compose.yml` 已配置卷挂载 (`./data:/app/data`)，即使删除容器，数据也不会丢失。
- **备份**：建议定期备份服务器上的 `data/` 目录。

---

## 方式二：Node.js 直接部署

适合传统的 Linux/Windows 服务器环境。

### 1. 准备环境
确保服务器已安装 Node.js (v18+) 和 NPM。

### 2. 构建项目
```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 3. 启动服务
推荐使用 `pm2` 进程管理器：

```bash
# 安装 pm2
npm install -g pm2

# 启动服务
pm2 start npm --name "multipost-ai" -- start
# 或者直接指定端口
PORT=3000 pm2 start npm --name "multipost-ai" -- start
```

### 4. 注意事项
- **数据文件**：确保项目根目录下存在 `data/db.json` 文件。
- **Git 冲突**：如果在服务器上直接修改了数据，`git pull` 时可能会遇到冲突。建议在服务器上使用 `.gitignore` 忽略 `data/db.json`，或者使用 Docker 部署以避免此问题。

---

## 环境变量配置

如果需要配置 DeepSeek API Key，请在根目录创建 `.env.local` 文件：

```bash
DEEPSEEK_API_KEY=sk-your-api-key-here
```

或者在 `docker-compose.yml` 中直接修改 `environment` 部分。
