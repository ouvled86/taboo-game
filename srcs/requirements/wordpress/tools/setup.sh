#!/bin/bash
set -e

# Wait for MariaDB
while ! mariadb -h mariadb -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -e "status" > /dev/null 2>&1; do
    sleep 1
done

if [ ! -f "/var/www/html/wp-config.php" ]; then
    wp core download --path=/var/www/html --allow-root
    wp config create --path=/var/www/html --dbname=${MYSQL_DATABASE} --dbuser=${MYSQL_USER} --dbpass=${MYSQL_PASSWORD} --dbhost=mariadb --allow-root
    wp core install --path=/var/www/html --url=${DOMAIN_NAME} --title="${WP_TITLE}" --admin_user=${WP_ADMIN_USER} --admin_password=${WP_ADMIN_PASSWORD} --admin_email=${WP_ADMIN_EMAIL} --skip-email --allow-root
    wp user create ${WP_USER} ${WP_USER_EMAIL} --user_pass=${WP_USER_PASSWORD} --role=author --path=/var/www/html --allow-root
    
    # Bonus Redis
    wp plugin install redis-cache --activate --path=/var/www/html --allow-root
    wp config set WP_REDIS_HOST ${REDIS_HOST} --path=/var/www/html --allow-root
    wp config set WP_REDIS_PORT ${REDIS_PORT} --raw --path=/var/www/html --allow-root
    wp redis enable --path=/var/www/html --allow-root
fi

exec "$@"
