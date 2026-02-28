# User Documentation - Inception VC

Welcome to the **Inception VC** platform. This guide will help you navigate and manage your new infrastructure.

## 1. Provided Services
- **Main Website**: A WordPress blog accessible at `https://ouel-bou.42.fr`.
- **Admin Panel**: Manage WordPress posts at `https://ouel-bou.42.fr/wp-admin`.
- **Database GUI**: Manage MariaDB tables via Adminer at `https://ouel-bou.42.fr/adminer`.
- **Static Portfolio**: A simple showcase site at `https://ouel-bou.42.fr/static`.
- **Monitoring**: Real-time resource usage dashboard at `http://localhost:8080`.
- **FTP Access**: Upload/download files to WordPress using port `21`.

## 2. Managing the Project
- **To Start**: Run `make` in the root directory.
- **To Stop**: Run `make down` to stop the containers without removing data.
- **To Reset**: Run `make clean` to remove containers and start fresh next time.

## 3. Credentials
Your credentials are managed in the `srcs/.env` file. 
- **WordPress Admin**: See `WP_ADMIN_USER` and `WP_ADMIN_PASSWORD`.
- **FTP**: See `FTP_USER` and `FTP_PASS`.
- **Database Root**: See `MYSQL_ROOT_PASSWORD`.

## 4. Health Check
To verify that everything is running correctly:
1.  Run `docker ps` - all 8 containers should be `Up`.
2.  Open `https://ouel-bou.42.fr` in your browser. (Ignore the SSL warning, as we use a self-signed certificate).
3.  Check the Monitoring dashboard at `http://localhost:8080`.
