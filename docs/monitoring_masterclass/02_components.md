# 02. Monitoring Components

The `monitoring` service is elegantly simple in its design. Unlike a complex monitoring stack that might involve separate components for data collection, storage, and visualization (like Prometheus, InfluxDB, and Grafana), this service bundles everything into two main parts: a single binary and a set of "probes" into the host system.

### 1. The cAdvisor Binary

The core of the service is the `cadvisor` binary.
- **Source:** As defined in the `Dockerfile`, this binary is downloaded directly from the official Google cAdvisor GitHub releases. It is a pre-compiled, standalone executable.
- **Functionality:** This single binary contains all the logic required for the service to function:
  - A **data collection agent** that knows how to gather metrics from the host and Docker daemon.
  - A **web server** that serves a built-in user interface for visualizing the data.
  - A **storage engine** that temporarily holds the collected metrics in memory.

The `ENTRYPOINT` of the container is simply to run this binary, making the container's purpose singularly focused on executing cAdvisor.

### 2. Host Volume Mounts (The "Sensors")

cAdvisor runs in a container, which is isolated from the host by default. To gather meaningful data about the host system and the other running Docker containers, it needs read-only access to specific system directories. These are provided via the `volumes` section in the `docker-compose.yml` file.

Think of these mounts as cAdvisor's "sensors" or "probes."

```yaml
# From docker-compose.yml
volumes:
  - /:/rootfs:ro
  - /var/run:/var/run:ro
  - /sys:/sys:ro
  - /var/lib/docker/:/var/lib/docker:ro
  - /dev/disk/:/dev/disk:ro
```

- **`/sys:/sys:ro`**: This virtual filesystem, provided by the Linux kernel, is cAdvisor's primary source for low-level resource metrics like CPU usage, memory statistics, and network activity.
- **`/var/lib/docker/:/var/lib/docker:ro`**: This gives cAdvisor access to the Docker root directory, allowing it to gather metrics about storage usage by different containers and images.
- **`/var/run:/var/run:ro`**: This is important because it contains the Docker daemon socket (`docker.sock`). By accessing this socket, cAdvisor can communicate with the Docker API to get a list of all running containers and their metadata (names, IDs, etc.).
- **`/:/rootfs:ro`**: This provides a view of the host's entire filesystem, which helps in analyzing filesystem usage and capacity.
- **`/dev/disk/:/dev/disk:ro`**: Provides low-level information about disk I/O activity.

The `:ro` flag on every single one of these mounts is a critical security feature. It ensures that the `monitoring` container can only **read** system information. It has no permission to write, modify, or delete anything on the host machine, strictly limiting its capabilities to its intended purpose.