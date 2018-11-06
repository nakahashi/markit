.PHONY: build
build:
	make

.PHONY: install
install:
	make

.PHONY: run
run:
	make

.PHONY: dev-install
dev-install:
	git config --local commit.template .gitmessage.txt
