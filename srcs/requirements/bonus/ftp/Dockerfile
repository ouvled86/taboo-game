FROM alpine:3.22.3

RUN apk add --no-cache \
    vsftpd \
    bash

COPY ./conf/vsftpd.conf /etc/vsftpd.conf
COPY ./tools/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh
RUN mkdir -p /var/run/vsftpd/empty

EXPOSE 20 21 21100-21110

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["vsftpd", "/etc/vsftpd.conf"]
