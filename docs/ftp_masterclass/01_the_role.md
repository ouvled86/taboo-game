# 01. The Role of the FTP Service

The `ftp` service provides a classic and direct way to manage the project's files: **File Transfer Protocol**. Its primary role is to grant a user direct, file-level access to the WordPress installation for uploading, downloading, and managing themes, plugins, and media.

### Why Use FTP?

While WordPress provides a web-based dashboard for managing most content, there are scenarios where direct file access is more efficient or even necessary:

- **Bulk Uploads/Downloads:** Uploading a large number of media files or a complex theme is often much faster via an FTP client than through the web interface.
- **Manual Plugin/Theme Installation:** Sometimes a plugin or theme needs to be installed manually by uploading its folder.
- **Debugging:** It provides a direct way to inspect log files or configuration files that may not be accessible through the web dashboard.
- **Development:** Developers often use FTP (or its more secure variants like SFTP/SSH) to quickly sync changes from their local machine to the server.

### How It Works

The FTP service in this project runs **vsftpd** (Very Secure FTP Daemon), a lightweight and secure FTP server.

It is configured to do two main things:

1.  **Provide Access to WordPress Files:** The `docker-compose.yml` file mounts the `wordpress_data` volume into the FTP container at `/var/www/html`. This is the exact same volume that the `wordpress` and `nginx` containers use, meaning the FTP service has direct access to all the same files.

2.  **Create a Dedicated User:** The service does not use an anonymous login. Instead, the `entrypoint.sh` script runs on startup and creates a single, dedicated Linux system user. The username and password for this user are read from the `FTP_USER` and `FTP_PASS` variables in your `.env` file. This user is then set as the owner of the `/var/www/html` directory, granting them full read/write permissions.

When you connect with an FTP client using these credentials, you are placed directly into the WordPress file system, ready to manage your site's files.