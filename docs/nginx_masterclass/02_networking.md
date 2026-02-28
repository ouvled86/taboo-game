# 02. Nginx Networking

Networking is central to Nginx's role as the project's gateway. It manages both the traffic coming from the outside world (external networking) and the communication between services inside the containerized environment (internal networking).

### External Networking: The Front Door

The only way for a user to access the Inception application is through the Nginx container. This is defined in the `docker-compose.yml` file:

```yaml
services:
  nginx:
    # ...
    ports:
      - "443:443"
    # ...
```

- **`ports: - "443:443"`**: This directive maps port `443` on the host machine to port `443` inside the Nginx container.
- When a user navigates to `https://ouel-bou.42.fr` (which resolves to your host machine's IP), their browser sends a request to port `443`.
- Docker intercepts this request and forwards it to port `443` inside the Nginx container, where the Nginx process is listening, as configured in `nginx.conf` (`listen 443 ssl;`).

This makes Nginx the sole entry point for all web traffic.

### Internal Networking: Service-to-Service Communication

All services in this project, including Nginx, are attached to a custom Docker network called `inception_net`.

```yaml
services:
  nginx:
    # ...
    networks:
      - inception_net
# ...
networks:
  inception_net:
    driver: bridge
```

A key feature of Docker's custom networks is its **internal DNS service**. This allows containers on the same network to find and communicate with each other simply by using their service names as hostnames. Nginx relies heavily on this for its reverse proxy functionality.

1.  **Communicating with WordPress:**
    When Nginx receives a request for a PHP page, it passes it to the WordPress container using `fastcgi_pass wordpress:9000;`. Here, `wordpress` is not just a name; Docker's DNS resolves `wordpress` to the internal IP address of the `wordpress` container on the `inception_net` network.

2.  **Communicating with Bonus Services:**
    The same principle applies to the bonus services defined in `nginx.conf`:
    - `proxy_pass http://adminer:8080/...`: Nginx resolves `adminer` to the Adminer container's IP address and forwards the request.
    - `proxy_pass http://static:80/`: Nginx resolves `static` to the static site container's IP address and forwards the request.

### Visualizing the Network Flow

This setup creates a clear and secure flow of traffic:

```plaintext
      User's Browser
           |
           | HTTPS (Public Internet, Port 443)
           v
+------------------------+
|   Host Machine         |
| +--------------------+ |
| |  NGINX Container   | |  <-- The Gateway
| |  (inception_net)   | |
| +--------------------+ |
|     |          |       |
+-----|----------|-------+
      |          |       | Internal Docker Network (inception_net)
      |          |       |
+-----+----------+-------+--------------------------------+
|                        |                                |
| FastCGI (Port 9000)    | HTTP (Port 8080)               | HTTP (Port 80)
v                        v                                v
+--------------------+ +--------------------+ +--------------------+
| WORDPRESS Container| |  ADMINER Container | |  STATIC Container  |
|  (inception_net)   | |  (inception_net)   | |  (inception_net)   |
+--------------------+ +--------------------+ +--------------------+
```