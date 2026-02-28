# 02. WordPress Networking

The `wordpress` service is a central hub in the project's internal network, acting as a client to backend services (MariaDB, Redis) and as a server for the Nginx gateway. It is completely isolated from the public internet.

### Inbound Connections: Listening for Nginx

Unlike a traditional web server, the WordPress container does not expose any ports to the host machine. You can see this in the `docker-compose.yml` file, where there is no `ports` directive for the `wordpress` service. This is a deliberate security design.

The container's only job is to process PHP scripts. It does this by running **PHP-FPM**, which is configured in `srcs/requirements/wordpress/conf/www.conf` to listen on port 9000:
```ini
listen = 0.0.0.0:9000
```
- The `nginx` service is the only service that communicates with WordPress on this port.
- It uses the FastCGI protocol to pass requests for PHP execution to WordPress.
- The directive `fastcgi_pass wordpress:9000;` in Nginx's configuration tells Nginx to find the container named `wordpress` on the `inception_net` network and send the request to port 9000.

### Outbound Connections: Connecting to Backend Services

The WordPress application needs to connect to other services to function correctly. It relies on the same Docker internal DNS mechanism as Nginx to find these services by their names.

#### 1. MariaDB (The Database)

WordPress is fundamentally a database-driven application. All content, user data, and site settings are stored in the MariaDB database.
- The `setup.sh` script explicitly waits for the database to be available before starting the installation: `while ! mariadb -h mariadb ...`
- During setup, it configures the database host using the service name `mariadb`:
  ```bash
  wp config create --dbhost=mariadb ...
  ```
This tells the WordPress application to connect to the container named `mariadb` on the default MySQL/MariaDB port (3306) for all its database operations.

#### 2. Redis (The Cache)

To improve performance, the project uses Redis as an object cache.
- The `setup.sh` script installs the `redis-cache` plugin.
- It then configures the `wp-config.php` file with the hostname for the Redis server:
  ```bash
  wp config set WP_REDIS_HOST ${REDIS_HOST} ...
  ```
The value for `${REDIS_HOST}` is set in the `.env` file and is simply `redis`, the service name of the Redis container. This directs the caching plugin to send all caching data to the `redis` service on the `inception_net` network.

### Visualizing the Network Flow

The `wordpress` container sits in the middle of the request-response lifecycle for dynamic content.

```plaintext
+---------+
|  NGINX  |
+---------+
     |
     | (Request for a PHP page)
     | FastCGI, Port 9000
     v
+-------------------+
|     WORDPRESS     |
| (inception_net)   |
|  - Processes PHP  |
|  - Queries DB     |
|  - Queries Cache  |
+-------------------+
     |           |
     |           | (Database queries)
     |           | TCP, Port 3306
     |           v
     |       +-----------+
     |       |  MARIADB  |
     |       +-----------+
     |
     | (Cache operations)
     | TCP, Port 6379
     v
 +---------+
 |  REDIS  |
 +---------+
```
This architecture isolates the application logic and its backend dependencies from the public-facing gateway, creating a more secure and modular system.