# 🐳 Inception VC: Advanced Infrastructure with Docker

*This project has been created as part of the 42 curriculum by ouel-bou.*

## 1. Description
Welcome to **Inception VC**, a professional-grade, multi-container infrastructure built entirely from custom Dockerfiles. This project demonstrates the orchestration of a web stack consisting of NGINX, WordPress, MariaDB, and five bonus services (Redis, FTP, Adminer, Static Site, and cAdvisor).

### The Architecture
- **Reverse Proxy**: NGINX (HTTPS only, TLSv1.2/v1.3)
- **Application Layer**: WordPress with PHP-FPM
- **Database Layer**: MariaDB
- **Performance**: Redis Object Cache
- **Access**: FTP Server (vsftpd)
- **Management**: Adminer (Database GUI)
- **Static Content**: Lightweight Static Site
- **Monitoring**: cAdvisor (Resource usage dashboard)

## 2. Instructions
To launch the infrastructure, follow these steps:

### Prerequisites
- Docker and Docker Compose installed.
- Access to a Linux environment (preferably a VM).

### Quick Start
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/ouel-bou/inception-vc.git
    cd inception-vc
    ```
2.  **Configure your environment**:
    - Update `/etc/hosts`: `127.0.0.1 ouel-bou.42.fr`
    - Review the `srcs/.env` file for credentials.
3.  **Build and launch**:
    ```bash
    make
    ```
4.  **Access the services**:
    - WordPress: `https://ouel-bou.42.fr`
    - Adminer: `https://ouel-bou.42.fr/adminer`
    - Static Site: `https://ouel-bou.42.fr/static`
    - Monitoring: `http://localhost:8080`

### Management Commands
- `make down`: Stop all containers.
- `make clean`: Remove all containers, images, and volumes.
- `make fclean`: Full cleanup (including host data directories).
- `make re`: Full rebuild and restart.

## 3. Technical Comparisons
### Virtual Machines vs. Docker
- **Virtual Machines**: Emulate hardware, run a full OS, and use more resources (CPU/RAM).
- **Docker**: OS-level virtualization, shares the host kernel, lightweight, and starts in seconds.

### Secrets vs. Environment Variables
- **Environment Variables**: Great for configuration and basic secrets, but visible in `docker inspect`.
- **Secrets**: More secure, stored encrypted by Docker Swarm or Kubernetes, and injected into containers as files.

### Docker Network vs. Host Network
- **Docker Network**: Provides isolation, internal DNS, and a virtual bridge between containers.
- **Host Network**: Containers share the host's IP and ports directly, offering no isolation but maximum performance.

### Docker Volumes vs. Bind Mounts
- **Docker Volumes**: Managed by Docker, more portable, and recommended for database storage.
- **Bind Mounts**: Maps to a specific path on the host, useful for development or configuration files.

## 4. Resources
- [Docker Documentation](https://docs.docker.com/)
- [NGINX Documentation](https://nginx.org/en/docs/)
- [WP-CLI Handbook](https://make.wordpress.org/cli/handbook/)
- [MariaDB Knowledge Base](https://mariadb.com/kb/en/)

---
*Professor's Note: Success in this project requires a deep understanding of networking, security, and the principles of containerization. Good luck, future Full Stack Engineers!*
