// 引入 ws 模块
const WebSocket = require('ws');
const uuid = require('uuid');
// 创建 WebSocket 服务器实例
const wss = new WebSocket.Server({ port: 8080 });

// 客户端列表（包含所有客户端 sessionId 和 WebSocket 实例）
const clients = new Map();

// 监听连接事件
wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    const sessionId = uuid.v4()
    clients.set(sessionId, ws);

    // 广播
    function broadcast(event, data) {
        // 向其他客户端广播消息，不包括当前客户端
        for (const [otherSessionId, otherWs] of clients.entries()) {
            if (otherSessionId !== sessionId) {
                sendMsg(otherWs, event, data)
            }
        }
    }

    function sendMsg(ws, event, data) {
        ws.send(JSON.stringify(
            {
                event,
                sessionId,
                data
            }
        ))
    }

    // 接收客户端发送的消息
    ws.on('message', (buffer) => {
        const { event, sessionId, data } = JSON.parse(buffer)
        if (event === 'LOGIN') {
            sendMsg(ws, 'LOGIN_RESULT')
            broadcast('PLAYER_JOINED', {x: 100, y: 450})
        }

        if(event === 'PLAYER_MOVED') {
            broadcast('PLAYER_MOVED', data)
        }

        if(event === 'PLAYER_MOVEMENT_ENDED') {
            broadcast('PLAYER_MOVEMENT_ENDED', data)
        }

    });

    // 连接关闭事件
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});