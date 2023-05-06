const socket = new WebSocket('ws://localhost:8080');

// 存储在线玩家信息
let onlinePlayers = [];


// 监听 WebSocket 连接事件
socket.onopen = () => {
    console.log('WebSocket connected');
};

function sendMsg(event, sessionId, data = {}) {
    const body = {
        event,
        sessionId,
        data
    }
    socket.send(JSON.stringify(body))
}

