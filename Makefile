NAME = vcinception
SRCS_DIR = srcs
DOCKER_COMPOSE = docker compose -f $(SRCS_DIR)/docker-compose.yml
LOGIN = ouvled
DATA_PATH = /home/$(LOGIN)/data

all: prepare $(NAME)

prepare:
	@mkdir -p $(DATA_PATH)/wordpress
	@mkdir -p $(DATA_PATH)/mariadb

$(NAME):
	@$(DOCKER_COMPOSE) up -d --build

down:
	@$(DOCKER_COMPOSE) down

clean:
	@$(DOCKER_COMPOSE) down --rmi all --volumes

fclean: clean
	@sudo rm -rf $(DATA_PATH)
	@docker system prune -a --force

re: fclean all

.PHONY: all prepare down clean fclean re
