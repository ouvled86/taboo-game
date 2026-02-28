# 02. FTP Networking

The networking for the FTP service is more complex than for a standard web server because the FTP protocol uses two separate types of connections: a **command channel** and a **data channel**.

### 1. The Command Channel (Port 21)

When you first connect to the FTP server, you connect to the **command channel**. This connection is used for sending commands (e.g., `USER`, `PASS`, `LIST`, `RETR`) and receiving responses from the server.

- This channel is established on the standard FTP port, `21`.
- The `docker-compose.yml` file maps this port from the host to the container:
  ```yaml
  ports:
    - "21:21"
  ```
- The `vsftpd.conf` file tells the server to listen for these incoming connections:
  ```ini
  listen=YES
  ```

### 2. The Data Channel (Passive Mode, Ports 21100-21110)

When you ask for a directory listing or initiate a file transfer, the actual data is not sent over the command channel. A separate, temporary **data channel** is opened for this purpose.

Modern FTP relies on **Passive Mode (PASV)** to establish this data channel, which works well with firewalls and the Network Address Translation (NAT) used by Docker.

Here is the workflow:
1.  The client establishes the command channel on port 21.
2.  When the client needs to transfer data (e.g., it sends a `LIST` command), it first sends a `PASV` command to the server.
3.  The server responds by opening a random port within a pre-defined range and tells the client, "Okay, connect to me on port `2110X`".
4.  The client then opens a *new* connection to the server on that specified port to transfer the data (the directory listing).
5.  Once the transfer is complete, the data channel is closed.

This project is explicitly configured to support Passive Mode:

- **`vsftpd.conf` enables and configures the port range:**
  ```ini
  pasv_enable=YES
  pasv_min_port=21100
  pasv_max_port=21110
  ```

- **`docker-compose.yml` exposes this exact port range to the host:**
  ```yaml
  ports:
    - "21100-21110:21100-21110"
  ```

This mapping is **essential**. Without it, the server would tell the client to connect to a port that is not accessible from outside the Docker environment, and the connection would time out, resulting in a "Failed to retrieve directory listing" error in most FTP clients.

Another key setting for working behind Docker's NAT is:
```ini
pasv_address=0.0.0.0
```
This tells vsftpd to intelligently use the IP address that the client connected with, ensuring the client knows how to get back to the server.

By correctly configuring and exposing ports for both the command and data channels, the FTP service is made fully accessible from an FTP client on any external machine.