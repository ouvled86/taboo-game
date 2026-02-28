# 04. Redis CLI and Commands

While Redis runs quietly in the background, there are times you'll want to connect to it directly to monitor its activity, debug a caching issue, or manually inspect the data being stored. The standard tool for this is `redis-cli`, the Redis Command-Line Interface.

### Accessing `redis-cli`

Because the Redis container does not expose any ports to the host machine, you cannot connect to it directly from your own terminal. Instead, you must first get a shell inside the running `redis` container.

You can do this with the `docker exec` command:
```bash
docker exec -it redis bash
```
- **`docker exec`**: Executes a command in a running container.
- **`-it`**: A combination of `-i` (interactive) and `-t` (pseudo-TTY), which gives you an interactive shell you can type in.
- **`redis`**: The name of the container to connect to.
- **`bash`**: The command to run (in this case, the bash shell).

Once you have a shell inside the container, you can launch the Redis CLI:
```bash
# You are now inside the redis container
redis-cli
```
This will connect to the locally running Redis server, and you will see a prompt like `127.0.0.1:6379>`. You can now issue commands directly to the server.

### Useful Commands for a WordPress Cache

Here are some of the most useful `redis-cli` commands for inspecting and debugging the WordPress object cache.

#### `PING`
This is the simplest command, used to check if the server is alive and responsive.
```
127.0.0.1:6379> PING
PONG
```
If you see `PONG`, you have a healthy connection.

#### `MONITOR`
This is an extremely powerful debugging tool. It streams every single command that the Redis server is processing in real-time.
```
127.0.0.1:6379> MONITOR
OK
```
After running `MONITOR`, simply browse your WordPress site. You will see a live feed of all the `GET`, `SET`, and other commands that the WordPress caching plugin is sending to Redis. This is the best way to confirm that the cache is actively being used. Press `Ctrl+C` to stop monitoring.

#### `KEYS *`
This command lists all keys currently stored in the cache.
```
127.0.0.1:6379> KEYS *
1) "wp:users:1"
2) "wp:options:all"
3) "wp:posts:5"
...
```
**Warning:** `KEYS *` can be a slow and blocking operation on databases with many keys. While it is safe to use for debugging in this small project, **you should never run `KEYS *` on a production Redis server with a large dataset.**

#### `GET <key>`
Retrieves the value stored for a specific key. You can get a key name from the `KEYS *` or `MONITOR` commands.
```
127.0.0.1:6379> GET "wp:options:all"
(some serialized PHP data will appear here)
```

#### `FLUSHALL`
This command deletes **every single key** from the Redis server. It completely clears the cache.
```
127.0.0.1:6379> FLUSHALL
OK
```
This is useful when you suspect the cache has stale (outdated) data and you want to force WordPress to fetch everything fresh from the MariaDB database. The cache will be rebuilt as you browse the site.