# Module 1: The Role of MariaDB in Micro-Infrastructure

Welcome to your first lesson. Before we touch a single line of configuration, we must understand the "Philosophy of the Database" in a containerized world.

## 1. Why MariaDB?
MariaDB is a community-developed fork of MySQL. In our stack, it acts as the **Source of Truth**. While NGINX handles traffic and WordPress handles logic, MariaDB handles **Persistence**. 

## 2. The Relationship Map
In our specific infrastructure, MariaDB has very specific neighbors:
- **WordPress**: Its "Best Friend." WordPress constantly talks to MariaDB to fetch posts, verify user passwords, and store settings. This happens over port **3306**.
- **Adminer**: Its "Manager." Adminer provides a visual interface for us to see inside the database. It also talks over port **3306**.
- **NGINX**: Its "Gatekeeper." **Crucially, NGINX does not talk to MariaDB.** NGINX only talks to WordPress. This is a security principle called **Least Privilege**.
- **Volumes**: Its "Permanent Memory." Without volumes, MariaDB would have amnesia every time the container restarts.

## 3. The "Inception" Constraints
Because we are building this "from scratch" using custom Dockerfiles:
1. We don't use the official MariaDB image. We build on **Debian**.
2. We must handle the **Initialization Phase** ourselves (creating the first database and users).
3. We must ensure the process stays in the **Foreground** (PID 1) so Docker doesn't think the container has finished its job and shut it down.

## 4. Summary of the Flow
1. **Request** comes to NGINX (HTTPS).
2. **NGINX** sends it to WordPress (FastCGI).
3. **WordPress** asks MariaDB for data (SQL).
4. **MariaDB** reads from the **Volume** (Disk).
5. **Data** flows back up the chain to the user.

In the next module, we will look at how the network makes this possible.
