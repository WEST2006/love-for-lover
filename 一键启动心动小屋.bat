@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 💗 正在启动「我们的心动小屋」...
start "" http://localhost:3001
node server/index.js
pause
