# WebSockets & Socket.IO

## The Problem: Real-Time Communication

HTTP is **request-response** — the client asks, the server answers. But in a multiplayer game, the server needs to **push** updates to all players instantly (new word, score change, timer tick).

```
Traditional HTTP:
  Client ──GET /score──> Server
  Client <──200 {s:5}── Server
  (Client must keep asking!)

WebSocket:
  Client <════════════> Server
  (Always connected, both can send anytime)
```

## WebSocket Protocol

WebSocket starts as an HTTP request, then **upgrades** to a persistent, bidirectional connection:

```
Client                          Server
  │                               │
  │── GET / (Upgrade: websocket) ─>│
  │<── 101 Switching Protocols ───│
  │                               │
  │<══════ Full Duplex ══════════>│
  │   Both sides can send/receive │
  │   messages at any time        │
  │                               │
```

### Key Properties

| Property | Description |
|----------|-------------|
| **Full-duplex** | Both client and server can send simultaneously |
| **Low latency** | No HTTP overhead per message |
| **Persistent** | Connection stays open until explicitly closed |
| **Event-driven** | Messages trigger event handlers |

## Socket.IO

Socket.IO is a library that provides WebSocket communication with **automatic fallbacks** and extra features:

- **Rooms** — group sockets together (perfect for game rooms)
- **Namespaces** — separate channels of communication
- **Auto-reconnection** — handles dropped connections
- **Broadcasting** — send to all clients in a room except the sender

### Server Side (Node.js)

```javascript
const { Server } = require('socket.io');
const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Listen for a custom event
  socket.on('join-room', (roomCode) => {
    socket.join(roomCode);  // Add to a room
    
    // Broadcast to everyone in the room
    io.to(roomCode).emit('player-joined', {
      id: socket.id,
      count: io.sockets.adapter.rooms.get(roomCode).size
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
  });
});
```

### Client Side (Browser)

```javascript
const socket = io();  // Connect to the server

// Emit a custom event
socket.emit('join-room', 'ABC123');

// Listen for events from server
socket.on('player-joined', (data) => {
  console.log(`${data.count} players in room`);
});
```

## Rooms — The Core of Multiplayer

Rooms are the key concept for our Taboo game. Each game lobby is a Socket.IO room:

```
io (server)
 ├── Room "XYZW"
 │    ├── Socket A (Player 1 - Team A)
 │    ├── Socket B (Player 2 - Team A)
 │    ├── Socket C (Player 3 - Team B)
 │    └── Socket D (Player 4 - Team B)
 └── Room "ABCD"
      ├── Socket E (Player 5 - Team A)
      └── Socket F (Player 6 - Team B)
```

### Room Operations

```javascript
// Join a room
socket.join('XYZW');

// Send to everyone in a room
io.to('XYZW').emit('event', data);

// Send to everyone EXCEPT the sender
socket.to('XYZW').emit('event', data);

// Leave a room
socket.leave('XYZW');
```

## Event Flow for Taboo Game

```
1. CREATE ROOM
   Host ──emit('create-room')──> Server
   Host <──emit('room-created', code)── Server

2. JOIN ROOM
   Player ──emit('join-room', code)──> Server
   All <──emit('player-joined', list)── Server

3. START GAME
   Host ──emit('start-game')──> Server
   All <──emit('game-started')── Server
   Describer <──emit('new-word', {word, forbidden})── Server

4. GAME ACTIONS
   Describer ──emit('correct')──> Server
   All <──emit('score-update', scores)── Server
   Describer <──emit('new-word', {word, forbidden})── Server

5. TIMER ENDS
   All <──emit('round-over', results)── Server
```

## Why Socket.IO over raw WebSockets?

| Feature | Raw WebSocket | Socket.IO |
|---------|--------------|-----------|
| Rooms | Manual | Built-in |
| Auto-reconnect | Manual | Built-in |
| Fallback (polling) | No | Yes |
| Broadcasting | Manual | Built-in |
| Event naming | Manual | Built-in |

## Further Reading

- [Socket.IO Docs](https://socket.io/docs/v4/)
- [WebSocket MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Socket.IO Rooms](https://socket.io/docs/v4/rooms/)
