.PHONY: build
build:
	npx webpack --config webpack.prod.js

.PHONY: dev
dev:
	npm run dev

.PHONY: clean
clean:
	rm -rf ./dist

.PHONY: install
install:
	npm install

.PHONY: run
run:
	make

.PHONY: test
test:
	npx mocha --compilers js:babel-register test/**/*.js

.PHONY: dev-install
dev-install:
	git config --local commit.template .gitmessage.txt
