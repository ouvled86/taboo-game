# 03. FTP Configuration

The behavior of the `vsftpd` server is controlled by a single, powerful configuration file located at `/etc/vsftpd.conf` inside the container. This file is copied from `srcs/requirements/bonus/ftp/conf/vsftpd.conf` during the image build.

Let's break down the key directives in this file.

### Connection & Standalone Mode
```ini
listen=YES
listen_ipv6=NO
```
- **`listen=YES`**: This runs `vsftpd` in "standalone" mode, meaning it acts as its own daemon, constantly listening for incoming connections. This is the standard mode for a dedicated FTP server.
- **`listen_ipv6=NO`**: Disables listening for connections on IPv6 sockets, restricting the server to IPv4 only.

### Authentication
```ini
anonymous_enable=NO
local_enable=YES
pam_service_name=vsftpd
```
- **`anonymous_enable=NO`**: This is a critical security setting that disables anonymous FTP access. Users cannot log in without a valid username and password.
- **`local_enable=YES`**: This allows users who have an account on the local Linux system (within the container) to log in. This is the mechanism our project uses, as the `entrypoint.sh` script creates a local user.
- **`pam_service_name=vsftpd`**: Specifies the PAM (Pluggable Authentication Modules) service name to use for authenticating these local users.

### Filesystem Permissions and Access
```ini
write_enable=YES
local_umask=022
local_root=/var/www/html
```
- **`write_enable=YES`**: Allows logged-in users to modify the filesystem (e.g., upload, delete, rename files). This is essential for the service's role of managing WordPress files.
- **`local_umask=022`**: Sets the default permissions for newly uploaded files. A umask of `022` means that files will be created with `644` permissions (read/write for the owner, read-only for everyone else), and directories with `755` permissions.
- **`local_root=/var/www/html`**: This sets the home directory for the FTP user to the root of the WordPress installation.

### Security: The `chroot` Jail
```ini
chroot_local_user=YES
allow_writeable_chroot=YES
secure_chroot_dir=/var/run/vsftpd/empty
```
This is one of the most important security features.
- **`chroot_local_user=YES`**: This "jails" the user in their home directory (`/var/www/html`). After logging in, the user cannot navigate to parent directories like `/var` or `/etc`. The root of their filesystem (`/`) appears to be `/var/www/html`, preventing them from accessing any other part of the container's filesystem.
- **`allow_writeable_chroot=YES`**: Historically, `vsftpd` required the `chroot` jail directory itself to *not* be writeable by the user as a security precaution. This created problems when the home directory itself needed to be writeable. This modern directive relaxes that restriction, allowing the jail to function correctly even when the user can write to their home directory.

### Networking (Passive Mode)
```ini
pasv_enable=YES
pasv_min_port=21100
pasv_max_port=21110
pasv_address=0.0.0.0
```
As covered in the networking document, these directives enable and configure Passive Mode, defining the specific range of ports to be used for data transfer channels. This is essential for FTP to work correctly through Docker's NAT.

### Logging
```ini
xferlog_enable=YES
```
This directive enables logging of file uploads and downloads. The log is typically stored at `/var/log/vsftpd.log` and can be viewed in real-time using the `docker logs -f ftp` command.