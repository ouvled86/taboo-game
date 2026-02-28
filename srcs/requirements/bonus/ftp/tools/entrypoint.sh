#!/bin/bash
set -eu

if ! id "${FTP_USER}" &>/dev/null; then
    adduser -D -s /bin/bash ${FTP_USER}
    echo "${FTP_USER}:${FTP_PASS}" | chpasswd
fi
chown -R ${FTP_USER}:${FTP_USER} /var/www/html

exec "$@"
