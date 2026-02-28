# 04. Users and Permissions

The FTP service is designed around a single, dedicated user whose credentials and permissions are configured dynamically when the container starts. This process is managed by the `entrypoint.sh` script and is driven by environment variables.

### Dynamic User Creation

The FTP user is not hard-coded into the Docker image. Instead, the `entrypoint.sh` script creates the user at runtime, ensuring that credentials are not stored in the version-controlled source code.

The source of the credentials is your `.env` file, which is loaded by Docker Compose. The `entrypoint.sh` script then reads these credentials from the environment.

#### The `entrypoint.sh` Script

Let's look at the user creation logic within the script:
```bash
#!/bin/bash
set -eu

if ! id "${FTP_USER}" &>/dev/null; then
    useradd -m -s /bin/bash ${FTP_USER}
    echo "${FTP_USER}:${FTP_PASS}" | chpasswd
fi
```
1.  **`if ! id "${FTP_USER}" &>/dev/null; then`**: This line checks if a user with the name specified by the `$FTP_USER` variable already exists. This makes the script idempotent, meaning it can be run multiple times without creating duplicate users or causing errors. The user is only created on the very first run.
2.  **`useradd -m -s /bin/bash ${FTP_USER}`**: If the user does not exist, this command creates a new local Linux user.
    - `-m`: Creates a home directory for the user (though this is ultimately overridden by the `local_root` setting in `vsftpd.conf`).
    - `-s /bin/bash`: Sets the user's default shell.
3.  **`echo "${FTP_USER}:${FTP_PASS}" | chpasswd`**: This command sets the user's password. It takes the username and password from the environment variables, formats them in the `user:password` format that the `chpasswd` tool expects, and pipes it to the tool to set the password non-interactively.

This user, now existing on the container's local system, is the user allowed to log in via FTP, as specified by the `local_enable=YES` directive in `vsftpd.conf`.

### Filesystem Ownership and Permissions

Creating the user is only half the story. For the user to be able to modify files, they must have the correct permissions at the operating system level. The `entrypoint.sh` script handles this with its final command before starting the server:

```bash
chown -R ${FTP_USER}:${FTP_USER} /var/www/html
```
- **`chown -R`**: This command recursively changes the ownership of files and directories.
- **`${FTP_USER}:${FTP_USER}`**: It sets the owner and the group to the newly created FTP user.
- **`/var/www/html`**: The target directory, which is the root of the WordPress installation.

This single command gives the FTP user full ownership of every file and folder in the WordPress directory. This is what allows them to upload, download, edit, and delete files when connected via an FTP client. The `write_enable=YES` setting in `vsftpd.conf` simply confirms to the FTP server that it should permit the user to use the OS-level permissions they have been granted.

Finally, when the FTP user uploads *new* files, their permissions are determined by the `local_umask=022` setting in the configuration, typically resulting in `755` for directories and `644` for files.