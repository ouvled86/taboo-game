# 03. Using Adminer

Adminer is a straightforward tool, but knowing the correct credentials and hostnames to use is essential. This guide provides a step-by-step walkthrough for accessing and using the Adminer service.

### Step 1: Accessing the Adminer URL

The Adminer interface is not exposed on its own port. It is only accessible through the Nginx reverse proxy. To access it, navigate to the following URL in your web browser, replacing `<your-domain>` with the domain specified in your `.env` file:

`https://<your-domain>/adminer`

For example: `https://ouel-bou.42.fr/adminer`

You should be greeted with the Adminer login screen.

### Step 2: Filling in the Login Credentials

To connect to the project's MariaDB database, you must fill in the form with the correct information. The values you need correspond directly to the variables in your `.env` file.

- **System:** Select `MySQL` from the dropdown menu. (MariaDB is a fully compatible fork of MySQL).

- **Server:** Enter `mariadb`.
  > **Important:** You must use the Docker service name, `mariadb`. Do not use `localhost` or `127.0.0.1`, as Adminer is running in a separate container and needs to connect to the database container over the Docker network.

- **Username:** Enter the value of your `MYSQL_USER` variable from the `.env` file.

- **Password:** Enter the value of your `MYSQL_PASSWORD` variable from the `.env` file.

- **Database:** Enter the value of your `MYSQL_DATABASE` variable from the `.env` file. This will take you directly to the WordPress database after you log in.

After filling in the fields, click the "Login" button.

### Step 3: Navigating the Interface

Once logged in, you will see the main Adminer dashboard for your WordPress database.

- **Left Panel:** A list of all tables in the database is displayed (e.g., `wp_options`, `wp_posts`, `wp_users`).
- **Right Panel:** Shows the main workspace.

#### Common Actions

- **View Table Data:** Click on a table name in the left panel (e.g., `wp_users`). The right panel will update to show you the rows of data within that table.
- **Run SQL Commands:** Click the "SQL command" link at the top left. This will open a text box where you can write and execute any raw SQL query, allowing for complex data manipulation or retrieval.
- **View Structure:** When viewing a table, click on the "Structure" tab at the top of the right panel to see the column names, data types, and indexes for that table.
- **Export:** The "Export" link on the left allows you to generate a backup of the entire database or individual tables in various formats (SQL, CSV).

Adminer is an intuitive tool, and exploring its interface is the best way to become familiar with its powerful features for database management.