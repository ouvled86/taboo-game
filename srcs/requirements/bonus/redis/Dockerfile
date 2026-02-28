FROM alpine:3.22.3

RUN apk add --no-cache redis

RUN sed -i "s/bind 127.0.0.1/bind 0.0.0.0/" /etc/redis.conf
RUN sed -i "s/protected-mode yes/protected-mode no/" /etc/redis.conf

EXPOSE 6379

CMD ["redis-server", "--protected-mode", "no"]
