# 02. Redis Networking

The networking for the Redis service is simple but secure. It is designed to be an **internal-only service**, accessible exclusively by other applications within the private Docker network.

### No External Access

The `docker-compose.yml` file for the `redis` service does not contain a `ports` section. This means that no ports from the Redis container are mapped to the host machine. It is completely inaccessible from the public internet or from the host computer's localhost. This is a critical security feature, as it prevents any unauthorized external access to the cache.

### Listening on the Internal Network

For other containers to connect to Redis, two things must be configured:

1.  **Network Attachment:** The `redis` service is attached to the `inception_net` network, making it visible to other services like `wordpress`.
    ```yaml
    # docker-compose.yml
    services:
      redis:
        networks:
          - inception_net
    ```

2.  **Binding to All Interfaces:** By default, Redis is configured for security and only listens for connections on the loopback interface (`127.0.0.1`), meaning only processes inside the same container could connect. To allow connections from other containers (like WordPress), the `Dockerfile` modifies the configuration:
    ```dockerfile
    # Dockerfile
    RUN sed -i "s/bind 127.0.0.1/bind 0.0.0.0/" /etc/redis/redis.conf
    ```
    The `bind 0.0.0.0` directive tells Redis to listen for connections on all available network interfaces within its container. This makes it accessible to any other container on the same `inception_net` network. It listens on the default Redis port, `6379`.

### The Client: WordPress

The only client for the Redis service in this project is the `wordpress` container. As detailed in the WordPress documentation, the `setup.sh` script configures the `wp-config.php` file to point to the Redis service:

```bash
# From wordpress/tools/setup.sh
wp config set WP_REDIS_HOST ${REDIS_HOST} ...
```

The `${REDIS_HOST}` environment variable is set to `redis`. When the WordPress caching plugin needs to connect to the cache, it uses the hostname `redis`. Docker's internal DNS service resolves this hostname to the private IP address of the `redis` container on the `inception_net` network, and the connection is established on port `6379`.

This setup creates a secure and efficient communication channel where the cache is readily available to the application but completely shielded from the outside world.