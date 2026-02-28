# Developer Documentation - Inception VC

This guide is intended for developers who want to understand, extend, or maintain the **Inception VC** infrastructure.

## 1. Environment Setup
### Prerequisites
- Docker (v20.10+)
- Docker Compose (v2.0+)
- `make` utility
- `sudo` privileges (for volume directory management)

### Configuration
All configuration is centralized in `srcs/.env`. Do NOT commit this file with real secrets in a production environment.

## 2. Architecture Overview
The project follows a modular design where each service has its own directory in `srcs/requirements/`:
- **Dockerfile**: Defines the build process from a clean `debian:bullseye` image.
- **conf/**: Contains static configuration files (Nginx configs, PHP pools).
- **tools/**: Contains dynamic setup scripts (WP-CLI installation, DB initialization).

## 3. Build and Deployment
The `Makefile` is the primary interface for managing the lifecycle:
- `make all`: Orchestrates the directory creation and `docker-compose up --build`.
- `make clean`: Uses `docker-compose down --rmi all --volumes` for a deep cleanup.

## 4. Data Persistence
Data is stored on the host machine to ensure it survives container deletion:
- **WordPress Files**: `/home/ouel-bou/data/wordpress`
- **Database Files**: `/home/ouel-bou/data/mariadb`
- **Volumes**: Managed via `docker-compose.yml` using the `local` driver with `bind` options.

## 5. Extending the Infrastructure
To add a new service:
1.  Create a directory in `srcs/requirements/bonus/<new_service>`.
2.  Define its `Dockerfile` and configuration.
3.  Add it to `srcs/docker-compose.yml`.
4.  Update NGINX configuration if the service requires web access.
