# 💗 我们的心动小屋 (Love Space)

专为异地恋打造的**「5 秒操作、满分强反馈」**双人专属网站与手机 App（安卓 `.apk` + iPhone 桌面图标），记录你们一起走过的 **重庆 · 成都 · 南京 · 石家庄**。

## ✨ 核心功能
1. **私密口令入口**：支持专属情侣空间暗号登录（初始口令 `5201314`，可在「空间设置」或环境变量 `LOVE_PASSCODE` 修改）。
2. **心动主页（电脑宽屏 / 手机 App 双适配）**：立体丝绒心跳共振台（想你/抱抱/亲一口/摸摸头 + 心有灵犀彩蛋）、1 秒情绪状态灯、预览对方接收效果。
3. **情绪温度计 & 吵架降温台**：0%~100% 情绪温度、灭火哄哄台、15 分钟冷静呼吸保护、吵架自动浮现的预防小纸条、举白旗雨过天晴。
4. **时光相册**：完整保存每一张历史拍立得（支持大图、补盖印章），以及 **重庆、成都、南京、石家庄** 多图旅行故事墙 + 下一站约定。
5. **互动小馆**：每日一问（双人答完同时解锁）、见面愿望清单、4 张一秒撒娇特权券。

---

## 📱 三步上线 & 生成手机软件（GitHub 一条龙）

### 第 1 步：把项目上传到你的 GitHub（建议建 **Private 私有仓库**）
在 `E:\Antigravity\Projects\love-space` 目录打开终端执行：
```bash
git init
git add .
git commit -m "init love-space"
git branch -M main
git remote add origin https://github.com/你的用户名/love-space.git
git push -u origin main
```

### 第 2 步：部署 24 小时在线后端（拿到公网 `https://` 地址）
* **推荐平台**：**Zeabur** 或 **Render**（用 GitHub 账号登录，导入刚才的私有仓库即可）。
* **关键配置（防重启丢照片）**：
  * 平台支持 `Dockerfile` 与 `render.yaml` 自动识别。
  * 务必添加一个**持久化存储卷（Volume）**挂载到 `/app/server/data`（Render 为 `/opt/render/project/src/server/data`）。
  * 可选环境变量：`LOVE_PASSCODE`（直接预设你们的专属口令）。
* 部署完成后，你会得到一个公网地址，例如 `https://love-space.zeabur.app`。

### 第 3 步：GitHub 云端自动打出你的安卓 `.apk` 安装包
1. 打开你的 GitHub 仓库 → 顶部点击 **Actions**；
2. 左侧选择 **`Build Android APK (心动小屋)`** → 右侧点 **Run workflow**；
3. 在 `server_url` 输入框里填入第 2 步拿到的公网地址（如 `https://love-space.zeabur.app`），点击运行；
4. 等待约 2 分钟构建完成，在页面最下方 **Artifacts** 下载 **`心动小屋-Android-APK`** 解压得到 `.apk`，传到你安卓手机直接安装！

### 第 4 步：她的 iPhone 添加桌面软件图标
* 她用 **iPhone Safari** 打开同一个 `https://...` 公网地址 → 点底部「分享」图标 →「添加到主屏幕」，以后桌面直接点图标全屏打开，永久不过期。
* 建议配合 App Store 免费工具 **Bark**，把 Bark 地址填进「空间设置」，你每次在安卓软件里点「想你」或「求抱抱」，她 iPhone 锁屏 1 秒就会震动弹窗！
