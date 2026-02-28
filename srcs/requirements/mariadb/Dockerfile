FROM alpine:3.22.3

RUN apk add --no-cache \
    mariadb \
    mariadb-client \
    bash

RUN mkdir -p /run/mysqld && chown mysql:mysql /run/mysqld
RUN mkdir -p /var/log/mysql && chown mysql:mysql /var/log/mysql

COPY ./conf/50-server.cnf /etc/my.cnf.d/99-server.cnf
RUN sed -i '/^skip-networking/d' /etc/my.cnf.d/mariadb-server.cnf
COPY ./tools/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3306

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["mysqld", "--user=mysql"]
