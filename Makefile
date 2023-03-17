export
NODE_OPTIONS := --openssl-legacy-provider

.PHONY: install
install:
	npm install

.PHONY: build
build:
	npx webpack --config webpack.prod.js

.PHONY: dev
dev:
	npm run dev

.PHONY: clean
clean:
	rm -rf ./dist
	rm -rf ./nodemodules

.PHONY: run
run:
	make

.PHONY: test
test:
	npx mocha --compilers js:babel-register test/**/*.js

.PHONY: dev-install
dev-install:
	git config --local commit.template .gitmessage.txt
