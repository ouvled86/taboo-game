FROM alpine:3.22.3

RUN apk add --no-cache nginx

COPY ./tools/index.html /var/www/html/index.html
COPY ./conf/nginx.conf /etc/nginx/http.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
