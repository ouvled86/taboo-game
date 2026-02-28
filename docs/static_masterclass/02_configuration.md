# 02. Static Site Configuration

The configuration for the `static` service is minimal and entirely self-contained within its Docker image. Unlike other services, it does not depend on any environment variables from the `.env` file.

The setup is handled by its `Dockerfile`, which performs two main configuration steps:

1.  It copies the `index.html` file into the Nginx web root directory (`/var/www/html/`).
2.  It copies a custom, lightweight `nginx.conf` file to configure the Nginx server.

### The `nginx.conf` File

The server's behavior is defined by a very simple `nginx.conf`:

```nginx
server {
    listen 80;
    root /var/www/html;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
```

Let's break down each part:

- **`listen 80;`**: Tells Nginx to listen on port 80, the standard port for unencrypted HTTP traffic.

- **`root /var/www/html;`**: Sets the document root directory. This is where Nginx will look for files to serve.

- **`index index.html;`**: Specifies that if a request is made for a directory, Nginx should try to serve the `index.html` file from within that directory.

- **`location / { ... }`**: This block handles all incoming requests.
  - **`try_files $uri $uri/ =404;`**: This directive instructs Nginx on how to find the requested file.
    1.  **`$uri`**: It first looks for a file with the exact name of the request URI.
    2.  **`$uri/`**: If no file is found, it checks for a directory with that name.
    3.  **`=404`**: If neither a file nor a directory is found, Nginx returns a `404 Not Found` error. This is the key difference from the main WordPress Nginx configuration, which has a PHP fallback. This server only knows how to serve static files.

Finally, the `Dockerfile` starts the server using the `CMD ["nginx", "-g", "daemon off;"]` command, which runs Nginx in the foreground with the configuration we've just described.