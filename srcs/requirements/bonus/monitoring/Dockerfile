FROM alpine:3.22.3

RUN apk add --no-cache \
    wget \
    ca-certificates

RUN wget https://github.com/google/cadvisor/releases/download/v0.49.1/cadvisor-v0.49.1-linux-amd64 -O /usr/local/bin/cadvisor \
    && chmod +x /usr/local/bin/cadvisor

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/cadvisor", "-logtostderr"]
