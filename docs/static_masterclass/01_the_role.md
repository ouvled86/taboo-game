# 01. The Role of the Static Site

The `static` service is the simplest bonus in the Inception project. Its role is to demonstrate the concept of **microservices** by serving a basic, standalone static website that is completely independent of the main WordPress application.

### What is a Static Site?

A static site consists of fixed content where every user sees the same page. The server's job is simply to deliver pre-built files (HTML, CSS, JavaScript, images) to the user's browser. This is in direct contrast to a dynamic site like WordPress, which generates pages on the fly by executing PHP code and querying a database.

The `static` service in this project is a minimal web server that serves a single `index.html` file.

### A Demonstration of Microservices

The true purpose of this service is to illustrate a microservice architecture.

- **Independence:** The `static` service runs in its own container with its own dedicated Nginx server. It knows nothing about WordPress or MariaDB.
- **Single Responsibility:** Its one and only job is to serve the content of its `index.html` file.
- **Composition:** The main Nginx gateway acts as a composer, integrating this separate, independent service into the main project. When a user navigates to the `/static/` URL, the main Nginx reverse proxies the request to this `static` service, making it appear to the end-user as if it's just another page on the main website.

This demonstrates how a large application can be built by composing multiple small, independent, and specialized services together, rather than building one single, monolithic application.