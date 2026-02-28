# 01. The Role of Monitoring

The `monitoring` service provides a real-time view into the health and performance of all the other containers running in the project. Its role is to collect, process, and display resource usage metrics, allowing you to understand how the different services are behaving.

This service is a standalone instance of **cAdvisor** (Container Advisor), an open-source monitoring tool created by Google.

### Why Monitor Your Containers?

Monitoring is a crucial aspect of managing any containerized application. It helps you to:
- **Identify Performance Bottlenecks:** Is a specific service (like MariaDB or WordPress) using an unusually high amount of CPU? Is the application running out of memory?
- **Debug Issues:** If the website feels slow, cAdvisor can help you see if a service is struggling or has stopped responding.
- **Understand Resource Consumption:** It gives you a clear picture of how much CPU, memory, network I/O, and disk I/O each container is using.
- **Ensure Stability:** By keeping an eye on resource trends, you can proactively identify potential problems before they cause an outage.

### How cAdvisor Works

cAdvisor is designed for simplicity. It runs as a single container and automatically discovers and collects metrics from all other containers running on the same host machine.

It achieves this by accessing the host's system and Docker daemon information. This is why the `docker-compose.yml` file for this service contains several read-only volume mounts from the host, such as `/sys/`, `/var/run/`, and `/var/lib/docker/`.

Once it gathers the data, cAdvisor serves a built-in web interface on port `8080` where you can view the metrics and graphs for each container.