# Node.js & Express.js

## What is Node.js?

Node.js is a **JavaScript runtime** built on Chrome's V8 engine. It lets you run JavaScript on the server, outside the browser.

### The Event Loop

Node.js is **single-threaded** but **non-blocking**. It uses an event loop to handle thousands of concurrent connections efficiently:

```
   ┌───────────────────────────┐
┌─>│         timers             │  ← setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks      │  ← I/O callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare        │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │          poll              │  ← incoming connections, data
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │          check             │  ← setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     close callbacks        │
│  └─────────────┬─────────────┘
└─────────────────┘
```

This is perfect for our Taboo game — we need to handle many simultaneous WebSocket connections from all players.

## What is Express.js?

Express is a **minimal, flexible web framework** for Node.js. It provides:

- **Routing** — map URLs to handler functions
- **Middleware** — functions that process requests in a pipeline
- **Static file serving** — serve HTML, CSS, JS files

### Basic Express Server

```javascript
const express = require('express');
const app = express();

// Middleware: serve static files from 'public' folder
app.use(express.static('public'));

// Route: handle GET request to /api/status
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', players: 4 });
});

// Start listening
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Middleware Pattern

Middleware functions are the backbone of Express. They execute in order, each receiving `(req, res, next)`:

```
Request → [Logger] → [Auth] → [Route Handler] → Response
              ↓          ↓
           next()     next()
```

```javascript
// Custom middleware: log every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // pass to next middleware
});
```

### Static File Serving

For our Taboo game, Express serves the frontend:

```javascript
// Everything in 'public/' is accessible via HTTP
app.use(express.static('public'));

// public/index.html  → GET /
// public/style.css   → GET /style.css
// public/app.js      → GET /app.js
```

## Why Node.js + Express for a Game Server?

| Feature | Benefit for Taboo |
|---------|-------------------|
| Non-blocking I/O | Handle many players simultaneously |
| JavaScript everywhere | Same language on client and server |
| npm ecosystem | Socket.IO for WebSockets, ready to use |
| Lightweight | Fits in a small Alpine container |
| JSON native | Game state is naturally JSON |

## `package.json` — Dependency Management

```json
{
  "name": "taboo-game",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.7.0"
  }
}
```

- `npm install` reads this file and downloads dependencies to `node_modules/`
- `--production` flag skips dev dependencies (smaller image)

## Further Reading

- [Node.js Docs](https://nodejs.org/en/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Understanding the Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick)
