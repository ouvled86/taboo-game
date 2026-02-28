# 05. FTP Security

While the name of the server software is `vsftpd` (Very Secure FTP Daemon), it's crucial to understand the security context of the File Transfer Protocol itself, as well as the specific measures this project takes to secure the service.

### The Inherent Insecurity of FTP

The FTP protocol dates back to the 1970s, an era when the internet was a much smaller and more trusted network. Its biggest security weakness is that it is a **plain text protocol**.

This means that all communication between the FTP client and server, including your **username, password, and all file data**, is transmitted without any encryption.

Anyone with the ability to "snoop" on the network traffic between you and the server could potentially intercept your credentials and see the contents of your files.

#### Is This a Problem for Inception?

For the intended purpose of this project (local development), the risk is generally considered low. You are likely connecting from your own machine (`localhost`) to the Docker container, so the traffic never leaves your computer. In this trusted environment, the lack of encryption is not a major concern.

However, it is critical to know that you should **never** use standard FTP to connect to a remote server over an untrusted network like public Wi-Fi.

### The `chroot` Jail: A Critical Security Feature

The most important security measure implemented in this project's FTP service is the **chroot jail**.

The `vsftpd.conf` file contains this directive:
```ini
chroot_local_user=YES
```
A `chroot` operation changes the root directory (`/`) of the current running process to a new path. When the FTP user logs in, `vsftpd` "jails" them inside their home directory, which is set to `/var/www/html`.

This means that from the FTP user's perspective, the directory `/var/www/html` *is* the root of the filesystem. They **cannot** navigate "up" to parent directories like `/var/` or `/etc/`. They are trapped inside the WordPress directory.

This is a vital security boundary. If an attacker were to guess the FTP user's password, the `chroot` jail would limit the damage they could do. They might be able to deface the WordPress site, but they would be prevented from accessing the container's system files, reading environment variables, or attempting to attack other services on the network.

### Other Security Best Practices Implemented

- **No Anonymous Access (`anonymous_enable=NO`):** Prevents unauthenticated users from accessing the server.
- **Principle of Least Privilege:** A single, non-root user is created specifically for the FTP service. This user only has ownership of the directory they need to manage (`/var/www/html`).

### Secure Alternatives for Production

For real-world, production servers, standard FTP is not recommended. Instead, you should always use one of its secure successors:

1.  **FTPS (FTP over SSL/TLS):** This is FTP wrapped in a TLS encryption layer, the same technology that powers HTTPS. It encrypts the command and data channels, protecting credentials and data.
2.  **SFTP (SSH File Transfer Protocol):** This is a completely different and more modern protocol that runs over a standard SSH connection. It is not related to FTP but provides the same functionality. It is generally easier to manage from a firewall perspective and is often preferred.