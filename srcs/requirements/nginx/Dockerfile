FROM alpine:3.22.3

RUN apk add --no-cache \
    nginx \
    openssl

RUN mkdir -p /etc/nginx/ssl

COPY ./conf/ouel-bou.42.fr.pem /etc/nginx/ssl/nginx.crt
COPY ./conf/ouel-bou.42.fr-key.pem /etc/nginx/ssl/nginx.key

COPY ./conf/nginx.conf /etc/nginx/http.d/default.conf

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
