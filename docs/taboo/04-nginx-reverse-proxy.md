# Nginx Reverse Proxy & WebSocket Proxying

## What is a Reverse Proxy?

A **reverse proxy** sits between clients and backend servers. Instead of clients talking directly to your app, they talk to Nginx, which forwards requests to the right backend.

```
Internet          Nginx (443)           Backend Services
─────────        ──────────────        ─────────────────
Browser ──HTTPS──> /           ──────> WordPress (9000)
                   /adminer    ──────> Adminer   (8080)
                   /static/    ──────> Static    (80)
                   /taboo/     ──────> Taboo     (3000)  ← NEW
```

### Benefits

| Benefit | Description |
|---------|-------------|
| **SSL Termination** | Nginx handles HTTPS, backends use HTTP |
| **Single Entry Point** | One port (443) for all services |
| **Load Balancing** | Distribute traffic (not needed here, but possible) |
| **Security** | Backend services are not directly exposed |

## `proxy_pass` Directive

The `proxy_pass` directive forwards requests to a backend:

```nginx
location /taboo/ {
    proxy_pass http://taboo:3000/;
}
```

### Trailing Slash Matters!

```nginx
# WITH trailing slash: strips the location prefix
location /taboo/ {
    proxy_pass http://taboo:3000/;
}
# Request:  /taboo/style.css
# Backend:  /style.css  ← prefix stripped

# WITHOUT trailing slash: keeps the full path
location /taboo/ {
    proxy_pass http://taboo:3000;
}
# Request:  /taboo/style.css
# Backend:  /taboo/style.css  ← prefix kept
```

For our Taboo game, we use the trailing slash so the app doesn't need to know it's behind `/taboo/`.

## WebSocket Proxying

WebSocket requires special headers to upgrade the HTTP connection:

```nginx
location /taboo/ {
    proxy_pass http://taboo:3000/;
    
    # Required for WebSocket
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    
    # Preserve original client info
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### Why Each Header Matters

| Header | Purpose |
|--------|---------|
| `proxy_http_version 1.1` | HTTP/1.1 supports persistent connections (required for upgrade) |
| `Upgrade $http_upgrade` | Passes the client's upgrade request (from HTTP to WebSocket) |
| `Connection "upgrade"` | Tells the backend to switch protocols |
| `Host $host` | Preserves the original hostname |
| `X-Real-IP $remote_addr` | Passes the client's real IP to the backend |

### The WebSocket Upgrade Flow Through Nginx

```
Browser                    Nginx                     Taboo Server
   │                         │                            │
   │── GET /taboo/socket.io/ │                            │
   │   Upgrade: websocket    │                            │
   │   Connection: Upgrade   │                            │
   │                         │                            │
   │                         │── GET /socket.io/          │
   │                         │   Upgrade: websocket       │
   │                         │   Connection: upgrade      │
   │                         │                            │
   │                         │<── 101 Switching Protocols │
   │<── 101 Switching Proto. │                            │
   │                         │                            │
   │<═══════ WebSocket tunnel through Nginx ═════════════>│
```

## Docker DNS Resolution

In `docker-compose.yml`, services on the same network can reach each other by **service name**:

```nginx
proxy_pass http://taboo:3000/;
#              ↑ Docker resolves 'taboo' to the container's IP
```

This works because Docker's built-in DNS resolves service names within the `inception_net` bridge network.

## Redirect Pattern

```nginx
location = /taboo {
    return 301 /taboo/;
}
```

This ensures that visiting `/taboo` (without trailing slash) redirects to `/taboo/`, which matches the `proxy_pass` location block.

## Further Reading

- [Nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Nginx WebSocket Proxying](https://nginx.org/en/docs/http/websocket.html)
- [Docker Networking](https://docs.docker.com/network/)
