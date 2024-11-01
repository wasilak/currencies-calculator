.PHONY dev: lint vite-dev go
.PHONY prod: lint vite go
.PHONY build-all-prod: lint yarn prod

yarn:
	@yarn install

vite:
	@yarn build

vite-dev:
	@yarn buildDev

lint:
	@yarn lint

go:
	@go build -o ./tmp/main .
