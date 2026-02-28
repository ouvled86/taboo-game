# Bonus Services: Enhancing Our Infrastructure

Welcome, students. Today we explore the extra layers that turn a basic web server into a high-performance, developer-friendly, and manageable platform.

## 1. Redis: High-Performance Caching
As WordPress grows, frequent database queries can slow down our application. **Redis** is an in-memory data store used as an object cache.
- **Purpose**: Instead of querying the database for the same data repeatedly, WordPress stores results in Redis.
- **Configuration**: We've configured Redis to listen on port **6379** within our internal network.
- **Activation**: Our WordPress setup script installs the **Redis Object Cache** plugin and connects it to the `redis` container.

## 2. FTP with vsftpd: Secure File Access
Sometimes developers need direct access to the WordPress files for manual updates or custom plugins.
- **Purpose**: Provides a standard **File Transfer Protocol (FTP)** interface.
- **Configuration**: We use **vsftpd**, a very secure and fast FTP server.
- **Shared Storage**: The FTP container mounts the same `wordpress_data` volume as NGINX and WordPress, allowing for real-time file updates.
- **Passive Mode**: To work correctly with Docker's networking, we've configured a passive port range (`21100-21110`).

## 3. Static Site: A Lightweight Alternative
Not all web pages need the complexity of WordPress and PHP.
- **Purpose**: Serves a simple, high-performance static website (HTML/CSS/JS).
- **Configuration**: A minimal NGINX container serving our "Inception VC" homepage.
- **Routing**: NGINX routes traffic on the `/static` sub-path to this container.

## 4. Adminer: Web-Based Database Management
Manually querying MariaDB from the command line can be tedious for developers.
- **Purpose**: Provides a clean, web-based interface for managing our WordPress database.
- **Configuration**: Adminer is a single-file PHP application served using PHP's built-in web server on port **8080**.
- **Security**: Like the static site, we've routed it through the main NGINX on the `/adminer` path.

## 5. cAdvisor: Real-Time Monitoring
How do we know if our containers are healthy or consuming too much memory?
- **Purpose**: Analyzes and exposes resource usage and performance characteristics of all running containers.
- **Configuration**: **cAdvisor** (Container Advisor) is a Google-developed tool that runs as a standalone daemon.
- **Access**: It connects to the host's Docker socket to gather data and provides a web dashboard on port **8080**.
- **Importance**: Monitoring is the eyes of a system administrator. Without it, you are blind to the state of your infrastructure.

## Key Takeaway
These bonus services demonstrate the power of **containerization**. We've added five distinct, powerful features to our infrastructure with minimal overhead, all while maintaining strict isolation and security between components.
