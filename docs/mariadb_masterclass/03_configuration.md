# Module 3: Configuration Deep Dive (50-server.cnf)

Today, we look at the "Brain" of the MariaDB service: the configuration file. On Debian, this is typically found at `/etc/mysql/mariadb.conf.d/50-server.cnf`.

## 1. The Essential Directives
When setting up MariaDB for a container stack, these four lines are your "Commandments":

### `user = mysql`
The database should never run as `root`. We run it as the `mysql` user for security. If an attacker "breaks out" of the database process, they only have the limited permissions of the `mysql` user, not full control of the container.

### `datadir = /var/lib/mysql`
This is where the actual data files (the `.ibd` files, the logs, the schemas) live. This is the directory we **must** mount to our Docker volume.

### `bind-address = 0.0.0.0`
As discussed in Module 2, this allows cross-container communication.

### `port = 3306`
The standard port for MySQL/MariaDB.

## 2. The Socket vs. The Network
- **Socket (`/run/mysqld/mysqld.sock`)**: Used for "Local" connections (when you are *inside* the MariaDB container).
- **TCP/IP**: Used for "Remote" connections (when WordPress talks to MariaDB).

## 3. Performance and Logging
For our Inception project, the defaults are usually fine, but in a professional environment, you would look at:
- `query_cache_size`: How much memory to dedicate to caching frequent queries.
- `log_error`: Where to record crashes or failed login attempts. This is vital for debugging!

## 4. Good Practice: Custom Config Files
Instead of editing the massive default `my.cnf`, it is better to provide a small, targeted `50-server.cnf` that overrides just what we need. This makes our Docker image smaller and our intentions clearer to other engineers.
