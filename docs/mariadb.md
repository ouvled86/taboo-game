# MariaDB: The Persistent Heart of Our Infrastructure

Welcome, students. Today we explore the most critical part of our application: the **MariaDB** database.

## 1. Purpose
A dynamic website like WordPress requires a place to store its content: posts, users, comments, and configuration settings. **MariaDB** is a robust, open-source relational database management system (RDBMS) that provides this storage.

## 2. Configuration Strategy
Our MariaDB service is built from a clean **Debian Bullseye** image. Here are the key architectural choices:

### Isolated Security
The database container does **not** expose any ports to the host machine. It only listens on its internal IP address within the `inception_net` network. This is a crucial security practice: if an attacker gains access to your host machine, they still cannot directly query your database unless they compromise the Docker network or another container.

### Persistence through Named Volumes
Databases must survive container restarts. We've configured a **Docker Named Volume** (`mariadb_data`) that maps to a persistent directory on the host's filesystem (`/home/ouel-bou/data/mariadb`). 

### Initialization Script
To ensure a fully functional database from the moment the container starts, we've implemented an `entrypoint.sh` script that:
- Initializes the MySQL data directory if empty (`mysql_install_db`).
- Creates the WordPress database and users.
- Sets root and user passwords securely using environment variables.
- Configures proper permissions for the WordPress user.

## 3. Key Concepts to Remember
- **RDBMS**: Relational Database Management System. Data is stored in tables with predefined schemas.
- **Environment Variables**: Never hardcode your database passwords! We inject them via the `.env` file for maximum security and flexibility.
- **Binding to 0.0.0.0**: By default, MariaDB only listens on `127.0.0.1`. Since our WordPress container is in a *different* network namespace, MariaDB must be configured to listen on all interfaces so it can accept connections from the WordPress container.
```ini
bind-address = 0.0.0.0
```
- **Named Volumes**: Unlike bind mounts, Docker manages the storage lifecycle of named volumes, though we've manually mapped ours to a host path as per the project's requirements.
