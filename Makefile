.PHONY: build
build:
	make

.PHONY: install
install:
	npm install

.PHONY: run
run:
	make

.PHONY: dev-install
dev-install:
	git config --local commit.template .gitmessage.txt
