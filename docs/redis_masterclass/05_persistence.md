# 05. Redis Persistence

Data persistence refers to storing data in a way that ensures it survives when the application or server restarts. For a primary database like MariaDB, persistence is non-negotiable. For a cache like Redis, the strategy is often different.

In the Inception project, the Redis service is configured to be **non-persistent**.

### The Ephemeral Nature of a Cache

The data stored in Redis is a temporary copy of data that permanently lives in the MariaDB database. Its purpose is not to be the ultimate source of truth, but to provide a fast, temporary copy to improve performance.

If the cache data is lost, it is not a critical problem. The WordPress application is designed to handle this:
1.  It requests an item from the cache (Redis).
2.  If the item is not there (a "cache miss"), it simply fetches the data from the primary source (MariaDB).
3.  It then saves a copy of this fresh data back into the cache for the next request.

This means that losing the entire cache only results in a temporary performance decrease for the first few page loads (a "cold start") while the cache is being repopulated.

### No Volume Mounted

The non-persistent strategy is implemented in the `docker-compose.yml` file. If you examine the definition for the `redis` service, you will notice that it has **no `volumes` section**.

```yaml
# docker-compose.yml
services:
  redis:
    build:
      context: ./requirements/bonus/redis
    image: redis
    container_name: redis
    restart: always
    networks:
      - inception_net
    # No 'volumes' directive is present
```

Redis has built-in mechanisms to save its in-memory data to a file on disk (e.g., `dump.rdb`). However, since we have not mounted a volume to the path where this file would be saved, any persistence file Redis creates is written to the container's own ephemeral filesystem.

This filesystem is destroyed whenever the container is removed (e.g., by running `docker-compose down`). When a new `redis` container is created, it starts with a completely empty filesystem and therefore an empty cache.

### The Correct Strategy for a Cache

Configuring the Redis cache as a non-persistent service is an intentional and correct design choice for this project. It reinforces the clear distinction between the services:

- **MariaDB:** The persistent, durable source of truth. Data loss is unacceptable. It uses a bind mount to ensure all database files are safely stored on the host machine.
- **Redis:** A disposable, ephemeral performance layer. Its data can be lost without consequence, as it can always be regenerated from MariaDB. It uses no volumes, embracing the ephemeral nature of containers.