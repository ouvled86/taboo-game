# Module 4: The Initialization Script and SQL Masterclass

This is the most technical part of our setup. We need a script that configures the database *only the first time* it starts. 

## 1. The Logic of "First Run"
How does our script know if the database is already set up? 
We check for the existence of the database folder:
`if [ ! -d "/var/lib/mysql/${MYSQL_DATABASE}" ]; then ...`

## 2. The SQL Bootstrap Method
To set up users and passwords securely, we use the `mysqld --bootstrap` command. This allows us to feed SQL commands directly into the database engine *before* it starts listening for network connections.

### The Essential SQL Commands
Let's break down the syntax you need to master:

#### `ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';`
On a fresh Debian install, the root user often has no password or uses "unix_socket" authentication. We must force it to use a strong password so we can manage it later.

#### `CREATE DATABASE IF NOT EXISTS wordpress;`
The container for all our tables.

#### `CREATE USER 'wp_user'@'%' IDENTIFIED BY 'wp_password';`
- `'wp_user'`: The username.
- `'%'`: The "Host." This is a wildcard that means "Allow this user to connect from ANY IP address." This is necessary because the WordPress container's IP might change.

#### `GRANT ALL PRIVILEGES ON wordpress.* TO 'wp_user'@'%';`
This gives our WordPress user full control over the `wordpress` database, but **nothing else**. This is security through isolation.

#### `FLUSH PRIVILEGES;`
Tells MariaDB to reload its internal permission tables so our changes take effect immediately.

## 3. The "Foreground" Rule
After the script finishes setting up the users, it must start the real database server. We use:
`exec mysqld`
The `exec` command is vital. It replaces the shell script process with the MariaDB process, making MariaDB **PID 1**. This ensures that when you run `docker stop`, Docker sends the "shutdown" signal directly to MariaDB, allowing it to close its files cleanly without corrupting your data.

## 4. Security Tip: `.env` vs Hardcoding
Notice we use `${MYSQL_USER}`. We never write the names or passwords in the script. We let Docker inject them from the `.env` file. This is the **Gold Standard** of DevSecOps.
