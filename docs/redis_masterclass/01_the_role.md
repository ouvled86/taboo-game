# 01. The Role of Redis

Redis (**RE**mote **DI**ctionary **S**erver) is a high-performance, in-memory data structure store. In the context of the Inception project, its sole purpose is to act as a **WordPress Object Cache** to significantly improve the site's performance.

### What is an Object Cache?

Every time a user visits a page on a WordPress site, WordPress performs many tasks. It queries the database to get site options, checks which plugins are active, retrieves post content, and more. While these operations are fast, performing them over and over again on every single page load can add up, slowing down the site, especially under heavy traffic.

An object cache solves this problem. It stores the results of complex operations (like database queries) in memory, which is orders of magnitude faster to access than a database.

The workflow is as follows:
1.  WordPress needs a piece of data (e.g., a site option).
2.  It first checks if the data exists in the Redis cache.
3.  **Cache Hit:** If the data is in Redis, it is returned to the application almost instantly, and the database is never touched.
4.  **Cache Miss:** If the data is not in Redis, WordPress retrieves it from the MariaDB database as normal. It then stores a copy of that data in Redis before returning it to the application.
5.  The next time that same piece of data is needed, it will be a "cache hit."

### Integration with WordPress

The `wordpress` service is explicitly configured to use Redis. The `setup.sh` script automates this integration:

1.  It installs the `redis-cache` plugin for WordPress.
2.  It activates the plugin.
3.  It configures `wp-config.php` to tell the plugin where the Redis server is located (at the hostname `redis`).
4.  It enables the cache using the `wp redis enable` command.

By offloading frequent and repetitive database queries to the Redis in-memory cache, the project reduces the load on the MariaDB service and decreases page load times, resulting in a faster, more responsive website.