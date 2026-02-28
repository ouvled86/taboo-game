# 03. Nginx Configuration

The heart of the Nginx service is its configuration file, located at `/etc/nginx/sites-available/default` inside the container (copied from `./srcs/requirements/nginx/conf/nginx.conf`). This file dictates exactly how Nginx handles incoming requests.

Let's break it down section by section.

### The `server` Block

The entire configuration is wrapped in a `server` block. This block defines a virtual server that handles requests for specific domains.

```nginx
server {
    # All directives go in here
}
```

### Listening Sockets and Server Name

These first directives define which port and domain this server block will respond to.

```nginx
listen 443 ssl;
listen [::]:443 ssl;

server_name ouel-bou.42.fr;
```
- **`listen 443 ssl;`**: Tells Nginx to listen for incoming connections on port 443 (standard for HTTPS) and to handle them using the SSL/TLS protocol. This covers IPv4 addresses.
- **`listen [::]:443 ssl;`**: Does the same thing for IPv6 addresses.
- **`server_name ouel-bou.42.fr;`**: Specifies that this server block should handle requests where the `Host` header matches `ouel-bou.42.fr`.

### Document Root and Index Files

This section tells Nginx where to find files and what to serve by default.

```nginx
root /var/www/html;
index index.php index.html;
```
- **`root /var/www/html;`**: Sets the root directory for requests. When a request for `/images/logo.png` comes in, Nginx looks for it at `/var/www/html/images/logo.png`. This path corresponds to the `wordpress_data` volume shared with the WordPress container.
- **`index index.php index.html;`**: Defines the order of files to look for if a directory is requested. It will first look for `index.php`, and if not found, it will look for `index.html`.

### SSL/TLS Configuration

These directives are essential for enabling HTTPS. A deeper dive is available in `04_ssl_and_security.md`, but their basic function is:

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_certificate /etc/nginx/ssl/nginx.crt;
ssl_certificate_key /etc/nginx/ssl/nginx.key;
```
- **`ssl_protocols`**: Restricts the connection to use only the strong `TLSv1.2` and `TLSv1.3` protocols.
- **`ssl_certificate`**: Points to the location of the public SSL certificate.
- **`ssl_certificate_key`**: Points to the location of the private key used to decrypt traffic.

### Location Blocks: The Routing Logic

`location` blocks are the most important part of the configuration. They determine how to handle requests based on the URI.

#### The Main `location /` Block

This block acts as the primary router for the WordPress site.

```nginx
location / {
    try_files $uri $uri/ /index.php?$args;
}
```
The `try_files` directive is a powerful front-controller pattern:
1.  **`$uri`**: Nginx first checks if a file exists with the exact name of the URI (e.g., `/about-us.html`). If so, it serves it.
2.  **`$uri/`**: If not, Nginx checks if a directory exists with that name (e.g., `/about-us/`). If so, it looks for an `index` file (e.g. `index.php`) inside it.
3.  **`/index.php?$args`**: If neither a file nor a directory is found, Nginx performs an internal redirect to `/index.php`, passing along the original query arguments. This allows WordPress to handle "pretty permalinks" like `/2023/10/my-post/` which don't correspond to actual file paths.

#### The PHP `location ~ \.php$` Block

This block is responsible for passing requests to the PHP-FPM processor.

```nginx
location ~ \.php$ {
    fastcgi_split_path_info ^(.+\.php)(/.+)$;
    fastcgi_pass wordpress:9000;
    fastcgi_index index.php;
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_param PATH_INFO $fastcgi_path_info;
}
```
- **`location ~ \.php$`**: Uses a regular expression to match any request URI that ends in `.php`.
- **`fastcgi_pass wordpress:9000;`**: The core directive. It passes the request to the upstream service named `wordpress` on port `9000`, where the PHP-FPM service is listening.
- **`include fastcgi_params;`**: Includes a standard set of variables to pass to the FastCGI server.
- **`fastcgi_param SCRIPT_FILENAME ...;`**: This is a crucial parameter that tells PHP-FPM the absolute path to the PHP script it needs to execute.

#### Bonus Services Location Blocks

These blocks demonstrate how Nginx can act as a simple reverse proxy to other services.

```nginx
location /static/ {
    proxy_pass http://static:80/;
}
```
- **`location /static/`**: Matches any request starting with `/static/`.
- **`proxy_pass http://static:80/`**: Forwards the entire request to the service named `static` on port `80`. This is a standard HTTP reverse proxy, distinct from the `fastcgi_pass` used for PHP.