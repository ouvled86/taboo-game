# 04. SSL and Security

This document covers how the Nginx service establishes a secure connection using SSL/TLS and other security considerations relevant to its role as the project's gateway.

### What is SSL/TLS?

SSL (Secure Sockets Layer) and its modern successor, TLS (Transport Layer Security), are protocols that provide security for communications over a network. When you see `https` and a padlock in your browser's address bar, you are using TLS. It provides three main benefits:

1.  **Encryption:** Hides the data being transferred from third parties.
2.  **Authentication:** Verifies that the server you are talking to is actually the server it claims to be.
3.  **Integrity:** Ensures that the data has not been tampered with during transfer.

In this project, Nginx is solely responsible for managing the TLS connection, a practice known as **SSL/TLS Termination**.

### The Certificate and Private Key

At the core of any TLS setup are a public certificate and a private key.

- **Public Certificate (`.crt`):** This file is sent to every connecting user. It contains the server's public key and information about its identity (e.g., the domain name). The browser uses it to encrypt data in a way that only the server can decrypt.
- **Private Key (`.key`):** This file is kept secret on the server. It is the only key capable of decrypting the information that was encrypted with the public certificate. **Its security is critical.**

In this project, the `Dockerfile` for Nginx copies a pre-existing certificate and key into the container:

```dockerfile
COPY ./conf/ouel-bou.42.fr.pem /etc/nginx/ssl/nginx.crt
COPY ./conf/ouel-bou.42.fr-key.pem /etc/nginx/ssl/nginx.key
```

These files are then referenced in `nginx.conf`:
```nginx
ssl_certificate /etc/nginx/ssl/nginx.crt;
ssl_certificate_key /etc/nginx/ssl/nginx.key;
```

#### Self-Signed Certificates

The certificate used in this project is "self-signed." This means it was not verified by a trusted public Certificate Authority (CA) like Let's Encrypt. Instead, it was signed by its own private key.

The `Dockerfile` contains a commented-out example of how such a certificate could be generated using `openssl`:
```dockerfile
# RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#     -keyout /etc/nginx/ssl/nginx.key \
#     -out /etc/nginx/ssl/nginx.crt \
#     -subj "/C=FR/ST=Paris/L=Paris/O=42/OU=Inception/CN=ouel-bou.42.fr"
```
For a public website, you would need a certificate from a trusted CA. For a local development project like Inception, a self-signed certificate is sufficient, though it will cause your browser to show a security warning that you must manually accept.

### Protocol Security

Not all versions of SSL/TLS are secure. The `nginx.conf` file specifies which protocols are allowed:
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
```
This is a crucial security measure. It disables older, vulnerable protocols such as SSLv3, TLS 1.0, and TLS 1.1, which are susceptible to attacks like POODLE and BEAST. By only allowing `TLSv1.2` and `TLSv1.3`, we ensure that the connection uses modern, strong cryptography.

### Other Security Considerations

- **Minimizing Attack Surface:** The `docker-compose.yml` file only exposes port `443`. All other services (MariaDB, WordPress, Redis) are only accessible from within the private Docker network. This significantly reduces the project's exposure to the outside world.
- **Principle of Least Privilege:** Nginx acts as a gatekeeper. It validates and forwards requests, but it has no direct access to the database or other sensitive components beyond what is necessary for its reverse proxy role.