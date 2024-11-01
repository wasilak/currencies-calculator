.PHONY dev: vite-dev go
.PHONY prod: vite go
.PHONY build-all-prod: yarn prod

yarn:
	@yarn install

vite:
	@yarn build

vite-dev:
	@yarn buildDev

go:
	@go build -o ./tmp/main .
