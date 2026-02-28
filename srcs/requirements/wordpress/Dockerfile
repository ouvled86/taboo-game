FROM alpine:3.22.3

RUN apk add --no-cache \
    php84-fpm \
    php84-mysqli \
    php84-pdo_mysql \
    php84-gd \
    php84-curl \
    php84-xml \
    php84-mbstring \
    php84-bcmath \
    php84-intl \
    php84-zip \
    php84-phar \
    php84-iconv \
    php84-tokenizer \
    php84-dom \
    php84-simplexml \
    php84-xmlwriter \
    php84-session \
    php84-openssl \
    php84-fileinfo \
    php84-exif \
    net-tools \
    curl \
    ca-certificates \
    mariadb-client \
    bash

RUN addgroup -S www-data 2>/dev/null; adduser -S -G www-data -s /sbin/nologin www-data 2>/dev/null; true

RUN ln -sf /usr/bin/php84 /usr/bin/php

RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp

RUN mkdir -p /run/php

# Increase PHP memory limit for WP-CLI extraction
RUN sed -i 's/memory_limit = .*/memory_limit = 512M/' /etc/php84/php.ini

COPY ./conf/www.conf /etc/php84/php-fpm.d/www.conf
COPY ./tools/setup.sh /usr/local/bin/setup.sh

RUN chmod +x /usr/local/bin/setup.sh

WORKDIR /var/www/html

ENTRYPOINT ["/usr/local/bin/setup.sh"]
CMD ["php-fpm84", "-F"]
