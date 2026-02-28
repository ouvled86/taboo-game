# 05. Logging and Caching

This document covers two important operational topics: how Nginx generates and stores logs, and its potential (though currently unused) role as a caching layer.

### Nginx Logging

Nginx maintains two primary types of logs:

1.  **`access_log`**: Records every single request that Nginx processes. Each entry includes information like the client's IP address, the request URI, the HTTP status code, the user agent, and more. This log is invaluable for seeing traffic patterns and debugging access issues.
2.  **`error_log`**: Records any errors or warnings encountered by the Nginx server. This is the first place you should look when you encounter a `5xx` error page (like 502 Bad Gateway) or other unexpected behavior.

In the project's `nginx.conf`, there are no `access_log` or `error_log` directives specified. This means Nginx uses its default settings, which log to `/var/log/nginx/access.log` and `/var/log/nginx/error.log` respectively, inside the container.

### Accessing Logs in a Docker Environment

While the log files exist inside the container, the standard and most convenient way to access them is through Docker's built-in logging driver. The Nginx process (`nginx -g 'daemon off;'`) is configured to send its output directly to the standard output and standard error streams, which Docker automatically captures.

To view the combined access and error logs for the Nginx service, use the following command from your terminal:
```bash
docker logs nginx
```

To follow the logs in real-time, which is extremely useful for live debugging, use the `-f` (or `--follow`) flag:
```bash
docker logs -f nginx
```
Any new request or error will appear in your terminal as it happens. This is the primary method you will use to troubleshoot problems with the Nginx service.

### Caching

Caching is the process of storing a copy of a resource (like a web page) and serving that copy for subsequent requests, rather than regenerating it every time. This can dramatically improve performance and reduce the load on backend services like WordPress.

Nginx has powerful built-in caching capabilities, such as:
- **`proxy_cache`**: Caches content from proxied servers.
- **`fastcgi_cache`**: Caches responses directly from the FastCGI backend (i.e., the PHP-FPM service).

**In the current Inception project, the `nginx.conf` file does not implement any of these Nginx-level caching mechanisms.**

Every request for a PHP page is passed directly to the `wordpress` service to be processed. While this is simple and ensures content is always fresh, it is not the most performant setup.

Caching for this project is likely intended to be handled at the application layer by WordPress itself, potentially using the **Redis** service (a dedicated in-memory cache) as its backend. Nginx's role is purely as a proxy and web server, not as a caching layer.