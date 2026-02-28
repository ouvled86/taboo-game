FROM alpine:3.22.3

RUN apk add --no-cache \
    php84 \
    php84-mysqli \
    php84-pdo_mysql \
    php84-session \
    wget \
    ca-certificates

RUN ln -sf /usr/bin/php84 /usr/bin/php

RUN mkdir -p /var/www/html
RUN wget "https://www.adminer.org/latest.php" -O /var/www/html/adminer.php

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "/var/www/html"]
