# 03. Monitoring Dashboards

The cAdvisor binary includes a built-in web user interface that provides a simple way to visualize the collected metrics. This section will guide you on how to access and navigate these dashboards.

### Step 1: Accessing the cAdvisor Web UI

The `monitoring` service is configured in `docker-compose.yml` to expose port `8080`. To access the main dashboard, navigate to the following URL in your web browser:

`http://localhost:8080`

> **Note:** cAdvisor serves its UI over `http`, not `https`.

You will be greeted with the main cAdvisor page, which shows high-level resource usage graphs for the entire host machine.

### Step 2: Navigating to Container-Specific Dashboards

The most useful feature of cAdvisor is its ability to isolate metrics for individual containers.

1.  From the main page, click on the **`/docker`** link. This will take you to a page listing all the Docker containers that cAdvisor has automatically discovered.
2.  You will see a list of familiar names from the project, such as `nginx`, `wordpress`, `mariadb`, `redis`, etc.
3.  Click on the name of any container (e.g., **`wordpress`**) to view its detailed monitoring dashboard.

### Step 3: Understanding the Container Dashboard

The container-specific dashboard presents a series of graphs that provide a real-time overview of the container's health and performance.

#### Key Graphs to Watch

- **CPU Total Usage:** This graph shows the amount of CPU time the container is consuming. Spikes in this graph indicate that the service is actively processing tasks. For example, you will see the `mariadb` CPU spike when you load a complex WordPress page.

- **Memory Usage:** This shows how much memory the container is currently using. It's useful for identifying "memory leaks" or determining if a service needs more resources. The line will typically grow to a certain point and then stabilize.

- **Network Usage:** This section contains graphs for network traffic.
  - **Rx:** Shows data being **received** by the container.
  - **Tx:** Shows data being **transmitted** by the container.
  For example, when you load a WordPress page, you will see `Tx` activity on the `nginx` container as it sends the page to your browser, and `Rx`/`Tx` activity between `nginx` and `wordpress` as they communicate.

- **Filesystem Usage:** This shows the disk read/write activity for the container. For the `mariadb` container, you will see write activity whenever WordPress saves new data. For the `wordpress` container, you'll see read activity when it loads plugin or theme files.

By switching between the dashboards for different containers, you can get a holistic view of how the services interact and consume resources, which is an invaluable tool for debugging and performance tuning.