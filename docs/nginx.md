# NGINX Configuration and Architecture

Welcome, students. Today we dive into the entry point of our infrastructure: **NGINX**.

## 1. Purpose
In a modern web architecture, we never expose our application servers directly to the internet. Instead, we use a **Reverse Proxy**. NGINX fulfills this role by being the only container listening on the host's port **443** (HTTPS). Its primary responsibilities are:
- Terminating SSL/TLS encryption.
- Serving static files (CSS, JS, images) directly from the shared volume.
- Routing dynamic requests (PHP) to the WordPress container via the FastCGI protocol.
- Proxying requests to our bonus services (Adminer, Static Site).

## 2. Configuration Highlights
Our NGINX service is built from a clean **Debian Bullseye** image. Here are the key architectural choices:

### SSL/TLS Security
Following the project's strict mandates, we only support **TLSv1.2** and **TLSv1.3**. This ensures that all communication between the client and our infrastructure is encrypted using modern, secure protocols.
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
```

### FastCGI Proxying
Since NGINX cannot execute PHP code itself, it must communicate with an external processor. We use the `fastcgi_pass` directive to send `.php` requests to the `wordpress` container on port `9000`.
```nginx
location ~ \.php$ {
    fastcgi_pass wordpress:9000;
    ...
}
```

### Routing and Sub-paths
To integrate our bonus services, we've configured NGINX to handle specific paths:
- `/adminer`: Proxies to the Adminer dashboard.
- `/static`: Proxies to our lightweight static website container.

## 3. Key Concepts to Remember
- **Reverse Proxy**: Acts as an intermediary for requests from clients seeking resources from other servers.
- **TLS Termination**: The process where the proxy server decrypts the SSL-encrypted traffic before passing it to the internal network.
- **Docker DNS**: Notice how we use `fastcgi_pass wordpress:9000;`. Docker provides an internal DNS that allows containers to find each other by their service names.
