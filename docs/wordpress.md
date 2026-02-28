# WordPress with PHP-FPM: The Application Layer

Welcome, students. Today we explore the engine of our web presence: **WordPress** powered by **PHP-FPM**.

## 1. Purpose
WordPress is a popular Content Management System (CMS) built on PHP. Its primary role is to process requests, fetch data from the MariaDB database, and generate HTML pages for our users.

## 2. Configuration Strategy
Our WordPress service is built from a clean **Debian Bullseye** image. Here are the key architectural choices:

### PHP-FPM (FastCGI Process Manager)
We use the **FPM** variant of PHP. Unlike the Apache module `mod_php`, PHP-FPM runs as a standalone daemon. This allows for better performance and scalability, especially when paired with a high-performance web server like NGINX.
- **Listen Address**: We've configured the PHP-FPM pool (`www.conf`) to listen on port **9000** for all interfaces.
```ini
listen = 0.0.0.0:9000
```
- **Foreground Mode**: Since Docker expects the main process to run as PID 1, we start PHP-FPM with the `-F` flag to keep it in the foreground.

### Automated Setup with WP-CLI
The evaluator expects WordPress to be **ready to use** from the moment the container starts. We've automated the entire installation process using **WP-CLI**, the official command-line interface for WordPress.
- **core download**: Fetches the WordPress source code.
- **config create**: Generates `wp-config.php` using our environment variables.
- **core install**: Configures the site URL, title, and admin user (not named `admin`!).
- **user create**: Adds a secondary non-admin user as required.
- **plugin install**: Activates the **Redis Object Cache** plugin for performance.

## 3. Key Concepts to Remember
- **FastCGI Protocol**: The standard binary protocol that allows a web server (NGINX) to send a request to a script processor (PHP-FPM).
- **WP-CLI**: A powerful tool for automating WordPress tasks from the command line.
- **Volume Sharing**: Notice how the `wordpress_data` volume is shared between the `wordpress` and `nginx` containers. This is because NGINX needs to serve the static files (like `style.css` and `image.png`) while PHP-FPM only handles the PHP files.
- **Foreground Process (PID 1)**: If the main process in a Docker container (like PHP-FPM) dies or goes into the background, the container will stop. This is why we never use `service php-fpm start` in our Dockerfiles.
