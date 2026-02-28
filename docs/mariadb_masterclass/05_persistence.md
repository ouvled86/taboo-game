# Module 5: Persistence and the Lifecycle of Data

In this final module, we look at where the data actually "lives" on your hard drive.

## 1. The Anatomy of `/var/lib/mysql`
Inside this directory, MariaDB creates:
- `ibdata1`: The system tablespace.
- `mysql/`: System-level users and permissions.
- `wordpress/`: All your blog posts and comments.

## 2. Bind Mounts vs. Named Volumes
In our `docker-compose.yml`, we use a **Bind Mount** masquerading as a Named Volume:
```yaml
volumes:
  mariadb_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /home/ouvled/data/mariadb
```
- **Why?**: The 42 project requires data to be stored in `/home/login/data`. 
- **The Risk**: MariaDB is very sensitive to file permissions. If the host folder (`/home/ouvled/data/mariadb`) is owned by the wrong user, MariaDB will fail to start with an "Access Denied" error. This is why our script/Dockerfile must ensure the `mysql` user has ownership of the data directory.

## 3. The Graceful Shutdown
Databases use **Write-Ahead Logging (WAL)**. If you pull the power (or `kill -9` a container), you might lose the last few seconds of data. 
- Always use `docker-compose down` or `make down`. 
- This sends a `SIGTERM` to MariaDB (PID 1).
- MariaDB then flushes its memory buffers to the disk and closes the volume safely.

## 4. Final Summary of MariaDB Best Practices
1. **Never run as root** (in the container or the DB).
2. **Bind to 0.0.0.0** but don't expose ports to the host.
3. **Use a dedicated user** for the application (WordPress).
4. **Automate the setup** with an idempotent script.
5. **Always use persistent volumes** for `/var/lib/mysql`.

Congratulations. You have completed the theoretical masterclass. You now have the knowledge to build, debug, and secure a MariaDB service from the ground up.
