# 03. Redis Configuration

The configuration for the Redis service is handled differently from the other services in this project. Instead of using a custom `redis.conf` file from a `conf` directory, the `Dockerfile` takes the default configuration file provided by the `redis-server` package and modifies it directly using `sed` commands during the image build process.

This approach is efficient, as it only changes the specific directives necessary for the project to function, relying on the well-tested Redis defaults for everything else.

### `Dockerfile` Configuration Steps

The `Dockerfile` for Redis performs two key configuration changes:

#### 1. `bind 0.0.0.0`
```dockerfile
RUN sed -i "s/bind 127.0.0.1/bind 0.0.0.0/" /etc/redis/redis.conf
```
As covered in the networking document, this directive is modified to allow Redis to accept connections from other containers on the private Docker network, not just from itself (`localhost`).

#### 2. `protected-mode no`
```dockerfile
RUN sed -i "s/protected-mode yes/protected-mode no/" /etc/redis/redis.conf
```
This is the most significant configuration change. **Protected mode** is a security feature in Redis designed to minimize the risk of public Redis instances being left open for anyone to access.

Protected mode is activated automatically if both of these conditions are true:
1.  Redis is **not** bound to `127.0.0.1` (i.e., it's accessible from other machines).
2.  No password has been set using the `requirepass` directive.

In our project, we meet both of these conditions: we bind to `0.0.0.0` and we have not set a password. Therefore, to allow the `wordpress` container to connect, we must explicitly disable protected mode.

This is considered safe in our specific context because the Redis service is **not exposed to the internet**. It exists only on a private Docker network, and its only client is the trusted `wordpress` container. If this Redis instance were accessible from the outside world, disabling protected mode without a password would be a major security vulnerability.

### Runtime Configuration

The `Dockerfile` also specifies the command to run when the container starts:
```dockerfile
CMD ["redis-server", "--protected-mode", "no"]
```
This command starts the Redis server. Note the inclusion of the `--protected-mode no` flag. While this is already set in the `redis.conf` file, including it in the runtime command provides an extra layer of certainty, ensuring this setting is applied every time the container starts.