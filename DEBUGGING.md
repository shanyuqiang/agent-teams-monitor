# Chrome DevTools 调试指南

## 启动应用

```bash
# 1. 启动后端
cd agent-teams-monitor/backend
npm run dev

# 2. 启动前端 (新终端)
cd agent-teams-monitor/frontend
npm run dev

# 3. 在 Chrome 中打开
open -a "Google Chrome" http://localhost:5173
```

## MCP Chrome DevTools 使用

### 可用命令

```bash
# 截图
claude mcp chrome-devtools take-screenshot

# 获取页面信息
claude mcp chrome-devtools get-page-info

# 执行 JavaScript
claude mcp chrome-devtools evaluate "document.title"

# 获取控制台日志
claude mcp chrome-devtools get-console-logs

# 获取网络日志
claude mcp chrome-devtools get-network-logs
```

### 调试技巧

1. **查看 WebSocket 连接**
   ```javascript
   // 在 Console 中执行
   socket.connected  // 查看连接状态
   socket.id         // 查看 socket ID
   ```

2. **监控实时消息**
   ```javascript
   // 监听所有 socket 事件
   socket.onAny((event, ...args) => {
     console.log('Event:', event, 'Args:', args);
   });
   ```

3. **检查文件监控状态**
   ```bash
   # 后端日志
   tail -f /tmp/backend.log
   ```

## 常见问题

### 前端无法连接后端
- 检查后端是否运行在 3001 端口
- 检查 CORS 配置

### WebSocket 连接失败
- 检查防火墙设置
- 确保后端 Socket.io 正常启动

### 文件变更未检测
- 检查文件路径是否正确
- 查看后端日志中的 watcher 状态
