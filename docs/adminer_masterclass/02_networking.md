# 02. Adminer Networking

The networking for the Adminer service is an excellent example of securing an internal tool by placing it behind a reverse proxy. Adminer is not directly accessible from the host machine; it can only be reached through the main Nginx gateway.

### Inbound Connections: Access via Nginx Reverse Proxy

Like the Redis service, the `adminer` service in `docker-compose.yml` does **not** expose any ports to the host computer. Instead, the `nginx.conf` file is configured with special `location` blocks to act as a gateway.

The workflow to access the Adminer interface is as follows:

1.  A user navigates to `https://<your-domain>/adminer` in their browser.
2.  The request is received by the **Nginx** container on port 443.
3.  Nginx matches the `/adminer` URI and processes the corresponding `location` block:
    ```nginx
    # From nginx.conf
    location = /adminer {
        proxy_pass http://adminer:8080/adminer.php;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    ```
4.  The `proxy_pass` directive tells Nginx to forward the request to the service named `adminer` on port `8080`.
5.  Docker's internal DNS resolves the hostname `adminer` to the private IP address of the Adminer container on the `inception_net` network.
6.  The request arrives at port `8080` in the Adminer container, where PHP's built-in web server is listening (`php -S 0.0.0.0:8080 ...`).
7.  The PHP server executes the `adminer.php` script, which generates the HTML login page.
8.  This HTML is passed back through Nginx to the user's browser.

This setup is secure and efficient. It hides the Adminer service from the public, reduces the number of open ports on the host machine, and allows users to access it through the same single, TLS-encrypted entry point as the main WordPress site.

### Outbound Connections: Connecting to MariaDB

Once the Adminer web page is loaded, it acts as a client to the database. When you fill in the login form on the Adminer page, the `adminer.php` script itself initiates a new, outbound connection to the database server.

You would typically enter the following on the Adminer login screen:
- **System:** `MySQL`
- **Server:** `mariadb`
- **Username:** (The value of `MYSQL_USER` from your `.env` file)
- **Password:** (The value of `MYSQL_PASSWORD` from your `.env` file)
- **Database:** (The value of `MYSQL_DATABASE` from your `.env` file)

When you click "Login", the Adminer container connects to the `mariadb` container on port 3306, again using Docker's internal DNS to resolve the hostname `mariadb`. All subsequent actions you take in the Adminer GUI are translated into SQL queries sent over this internal connection.