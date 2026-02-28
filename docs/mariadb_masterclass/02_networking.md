# Module 2: The Docker Bridge and Internal Communication

In this lesson, we discuss how MariaDB "talks" to other containers while staying invisible to the outside world.

## 1. The Bridge Network
In Docker Compose, when we define a `network`, Docker creates a **Virtual Bridge**. 
- Every container on this bridge gets its own internal IP address (e.g., `172.18.0.3`).
- Docker provides an internal **DNS Server**. This is the magic that allows WordPress to connect to a host named `mariadb` instead of an IP address.

## 2. The "Bind-Address" Trap
By default, a MariaDB installation on Debian is configured to listen only on `127.0.0.1` (localhost).
- **The Problem**: In a container stack, `localhost` inside the MariaDB container refers *only* to itself. The WordPress container is a different "machine" with a different IP.
- **The Solution**: We must change the `bind-address` to `0.0.0.0`. This tells MariaDB: "Listen for connections on ALL your network interfaces, including the one connected to the Docker Bridge."

## 3. Why No Exposed Ports?
You will notice in our `docker-compose.yml` that MariaDB has **no `ports` section**.
- **Security Best Practice**: We only want WordPress and Adminer to talk to the database. By not mapping port `3306` to the host machine, we ensure that no one from the internet (or even from the host VM) can attempt to brute-force our database password. 
- Only containers on the *same* Docker network can reach port `3306`.

## 4. Port 3306 vs 9000 vs 443
- **443 (NGINX)**: Open to the world.
- **9000 (WordPress)**: Internal only (NGINX -> WordPress).
- **3306 (MariaDB)**: Internal only (WordPress/Adminer -> MariaDB).

This "layered" approach is what we call **Defense in Depth**.
