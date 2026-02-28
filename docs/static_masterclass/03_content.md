# 03. Static Site Content

The content for the `static` service is, as the name implies, static. It is not stored in a database or generated dynamically. It consists of a single HTML file that is baked into the Docker image when it is built.

### The `index.html` File

The source of the content is the file located at: `srcs/requirements/bonus/static/tools/index.html`.

The `Dockerfile` for this service copies this file directly into the Nginx web root directory inside the container:
```dockerfile
COPY ./tools/index.html /var/www/html/index.html
```
This makes the file available to be served by Nginx to any user who is proxied to this service.

### File Contents

The `index.html` file is a simple, self-contained HTML document with embedded CSS for styling.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Inception VC - Static Site</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding-top: 50px; background-color: #f4f4f4; }
        h1 { color: #333; }
        p { color: #666; }
    </style>
</head>
<body>
    <h1>Welcome to Inception VC Bonus Site</h1>
    <p>This is a simple static website served from a custom Docker container.</p>
</body>
</html>
```

### How to Modify the Content

Because the `index.html` file is copied into the image at **build time**, you cannot change the content of the site dynamically while it is running.

To modify the static page, you must:

1.  **Edit the File:** Make your desired changes to the `srcs/requirements/bonus/static/tools/index.html` file on your host machine.

2.  **Rebuild the Image:** For your changes to be reflected, you must rebuild the Docker image for the `static` service. Run the following command from the root of the project:
    ```bash
    docker-compose build static
    ```
    Alternatively, you can rebuild all services with `docker-compose build`.

3.  **Restart the Services:** Bring your services up again with the newly built image:
    ```bash
    docker-compose up -d
    ```

Now, when you visit `https://<your-domain>/static/`, you will see your updated content.

This process stands in sharp contrast to the main WordPress site, where content is dynamic and can be changed at any time through the web dashboard without ever needing to rebuild a Docker image. This highlights the fundamental difference between a static and a dynamic web service.