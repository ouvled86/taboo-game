# 04. Scripting and WP-CLI

Automation is a cornerstone of the Inception project, and the `wordpress` service is a prime example of this. The entire setup, from downloading WordPress to creating users, is handled automatically by a shell script that leverages a powerful tool: **WP-CLI**.

### WP-CLI: The WordPress Command-Line Interface

WP-CLI is the official command-line tool for managing WordPress installations. It allows you to perform administrative tasks (like installing core, managing plugins, creating users) without needing to use a web browser.

In this project, WP-CLI is installed directly into the container via the `Dockerfile`:
```dockerfile
RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp
```
This makes the `wp` command available anywhere inside the container.

### The Anatomy of the `setup.sh` Script

The `tools/setup.sh` script is the `ENTRYPOINT` for the container, meaning it's the very first thing that runs. Its purpose is to prepare the environment and then hand off control to the main PHP-FPM process.

Let's break down its key commands:

#### 1. Waiting for the Database
```bash
#!/bin/bash
set -e

while ! mariadb -h mariadb -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -e "status" > /dev/null 2>&1; do
    sleep 1
done
```
- **`set -e`**: This command ensures that the script will exit immediately if any command fails, preventing unexpected behavior.
- **`while ! mariadb ...`**: This loop uses the `mariadb-client` to repeatedly try connecting to the `mariadb` service. The loop will not break until the connection is successful, guaranteeing that the database is ready before the script proceeds.

#### 2. The "Run Once" Logic
```bash
if [ ! -f "/var/www/html/wp-config.php" ]; then
    # ... all installation commands go here ...
fi
```
This is the most important control structure in the script. It checks if the `wp-config.php` file already exists. Since this file is stored on a persistent volume, it will only be missing the very first time the container is started. This prevents the script from re-installing WordPress every time the container restarts.

#### 3. Core Installation with WP-CLI
Inside the `if` block, a series of `wp` commands automate the entire installation:
```bash
# Download WordPress files
wp core download --path=/var/www/html --allow-root

# Create the wp-config.php file
wp config create --path=/var/www/html --dbname=${MYSQL_DATABASE} --dbuser=${MYSQL_USER} --dbpass=${MYSQL_PASSWORD} --dbhost=mariadb --allow-root

# Run the WordPress installation
wp core install --path=/var/www/html --url=${DOMAIN_NAME} --title="${WP_TITLE}" --admin_user=${WP_ADMIN_USER} ... --allow-root

# Create an additional user
wp user create ${WP_USER} ${WP_USER_EMAIL} --user_pass=${WP_USER_PASSWORD} --role=author ... --allow-root
```
- **`--path=/var/www/html`**: Tells WP-CLI where the WordPress installation is located.
- **`--allow-root`**: This flag is necessary because the `setup.sh` script is run by the `root` user. WP-CLI normally discourages running as root for security reasons, but it's required in this initial setup context.

#### 4. Plugin and Bonus Configuration
The script also handles the setup for the Redis bonus:
```bash
wp plugin install redis-cache --activate --path=/var/www/html --allow-root
wp config set WP_REDIS_HOST ${REDIS_HOST} --path=/var/www/html --allow-root
wp redis enable --path=/var/www/html --allow-root
```
This demonstrates how easily WP-CLI can manage plugins and modify the configuration on the fly.

#### 5. Handing Over Control
```bash
exec "$@"
```
This is the final and most crucial command. `exec` replaces the current process (the shell script) with the new command specified. `"$@"` represents the arguments passed to the script, which, in this case, is the `CMD` from the `Dockerfile` (`php-fpm7.4 -F`).

This effectively transitions the container from a "setup" container to a "runtime" container, running the PHP-FPM server to handle requests from Nginx.