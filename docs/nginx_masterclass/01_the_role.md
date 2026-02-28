# 01. The Role of Nginx

In the Inception project, the Nginx service is not just a simple web server; it acts as the main gateway for all incoming web traffic and plays several critical roles. It is the only service (besides FTP) that exposes ports directly to the host machine, making it the front door to the entire application stack.

### 1. Web Server for Static Content

Nginx's most fundamental role is as a web server. Based on the `docker-compose.yml` file, the `wordpress_data` volume (which contains all of WordPress's files) is mounted directly into the Nginx container at `/var/www/html`.

The `nginx.conf` file sets this path as the `root` directory.
```nginx
root /var/www/html;
```
This means when a request comes in for a static file like an image (`.jpg`), a stylesheet (`.css`), or a javascript file (`.js`), Nginx can serve it directly and efficiently from the filesystem without ever needing to bother the WordPress (PHP) application.

### 2. Reverse Proxy

This is Nginx's most important role in the project. While Nginx can serve static files, it cannot execute PHP code, which WordPress is built on. Instead, it acts as a **reverse proxy** to pass PHP requests to the service that can handle them.

The `location ~ \.php$` block in `nginx.conf` is key to this behavior:
```nginx
location ~ \.php$ {
    ...
    fastcgi_pass wordpress:9000;
    ...
}
```
This configuration does the following:
- It matches any request that ends with `.php`.
- It uses `fastcgi_pass` to forward the request to the `wordpress` service (as named in `docker-compose.yml`) on port `9000`.
- The WordPress container, running PHP-FPM (FastCGI Process Manager), receives the request, executes the necessary PHP script, and returns the result to Nginx.
- Nginx then sends this result back to the user's browser.

Nginx also acts as a reverse proxy for the bonus services:
- Requests to `/adminer` are proxied to the `adminer` service.
- Requests to `/static/` are proxied to the `static` service.

### 3. SSL/TLS Termination Point

Security is handled directly by Nginx. It is responsible for **SSL/TLS Termination**.

- The `docker-compose.yml` exposes port `443` (the standard port for HTTPS) to the host machine.
- `nginx.conf` is configured to listen on this port and handle SSL/TLS traffic.
- It loads the SSL certificate and key (`nginx.crt` and `nginx.key`) specified in the `Dockerfile` and configuration.
- It handles the TLS handshake with the user's browser, decrypting incoming HTTPS traffic.

This means that traffic between the user and Nginx is encrypted (HTTPS). The traffic between Nginx and the other internal services (like WordPress) is unencrypted (HTTP), but this is secure because it all happens within the private Docker network (`inception_net`). This simplifies the configuration of the other services, as they don't need to handle SSL themselves.