# Docker & Alpine Linux with Node.js

## What is Docker?

Docker is a **containerization platform** that packages your application and all its dependencies into a standardized unit called a **container**. Unlike virtual machines, containers share the host OS kernel, making them lightweight and fast.

```
┌──────────────────────────────────┐
│          Host Machine            │
│  ┌────────┐  ┌────────┐         │
│  │Container│  │Container│        │
│  │ Node.js │  │  Nginx  │        │
│  │  App    │  │  Proxy  │        │
│  └────────┘  └────────┘         │
│       Docker Engine              │
│       Host OS (Linux)            │
└──────────────────────────────────┘
```

## Why Alpine Linux?

Alpine Linux is a **security-oriented, lightweight** Linux distribution (~5MB base image). It uses:

- **musl libc** instead of glibc (smaller footprint)
- **apk** package manager (fast, simple)
- **BusyBox** for core utilities

### Size Comparison

| Base Image    | Size   |
|---------------|--------|
| Ubuntu        | ~77MB  |
| Debian        | ~124MB |
| **Alpine**    | **~5MB** |

In a 42 Inception project, Alpine is preferred because:
1. Smaller attack surface (fewer packages = fewer vulnerabilities)
2. Faster builds and pulls
3. Meets the project requirement to use the penultimate stable version

## Node.js on Alpine

Node.js is available via Alpine's `apk` package manager:

```dockerfile
FROM alpine:3.22.3

# Install Node.js and npm
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy package files first (Docker layer caching)
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
```

### Key Dockerfile Concepts

| Instruction | Purpose |
|-------------|---------|
| `FROM`      | Base image to build on |
| `RUN`       | Execute commands during build |
| `COPY`      | Copy files from host to image |
| `WORKDIR`   | Set the working directory |
| `EXPOSE`    | Document which port the app uses |
| `CMD`       | Default command when container starts |

### Docker Layer Caching

Notice we copy `package.json` **before** the rest of the code. This is intentional — Docker caches each layer. If only your code changes (not dependencies), Docker reuses the cached `npm install` layer, making rebuilds much faster.

```
Layer 1: FROM alpine          ← cached
Layer 2: RUN apk add nodejs   ← cached
Layer 3: COPY package.json    ← cached (if unchanged)
Layer 4: RUN npm install      ← cached (if package.json unchanged)
Layer 5: COPY . .             ← rebuilt (code changed)
```

## `--no-cache` Flag

```bash
apk add --no-cache nodejs npm
```

The `--no-cache` flag tells `apk` not to store the package index locally. This keeps the image smaller since we don't need the index after installation.

## Further Reading

- [Alpine Linux Wiki](https://wiki.alpinelinux.org)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Node.js Docker Guide](https://nodejs.org/en/docs/guides/nodejs-docker-webapp)
