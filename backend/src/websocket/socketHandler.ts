import { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';

interface ExtendedWebSocket extends WebSocket {
  groupCode?: string;
}

let wss: WebSocketServer | null = null;

export const initWebSocket = (server: Server): void => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: ExtendedWebSocket) => {
    console.log('🔌 New WebSocket connection established');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        handleMessage(ws, data);
      } catch (error) {
        console.error('❌ Invalid WebSocket message:', (error as Error).message);
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket connection closed');
    });

    // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection_success',
        message: 'Connected to FIT-O-CHARITY Dashboard Real-time Updates',
        timestamp: new Date().toISOString()
      }));
  });

  console.log('✅ WebSocket server initialized');
};

export const broadcastActivity = (activity: any): void => {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'new_activity',
    data: activity,
    timestamp: new Date().toISOString()
  });

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  console.log('📡 Broadcasted new activity:', activity.participantName);
};

export const broadcastLeaderboardUpdate = (leaderboard: any): void => {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'leaderboard_update',
    data: leaderboard,
    timestamp: new Date().toISOString()
  });

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  console.log('📡 Broadcasted leaderboard update');
};

export const broadcastStatsUpdate = (stats: any): void => {
  if (!wss) return;

  const message = JSON.stringify({
    type: 'stats_update',
    data: stats,
    timestamp: new Date().toISOString()
  });

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const handleMessage = (ws: ExtendedWebSocket, data: any): void => {
  switch (data.type) {
    case 'subscribe_group':
      ws.groupCode = data.groupCode;
      console.log(`📡 Client subscribed to group: ${data.groupCode}`);
      break;
      
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      break;
      
    default:
      console.log('Unknown message type:', data.type);
  }
};
