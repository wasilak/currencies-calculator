.PHONY install: yarn
.PHONY dev: lint vite-dev go
.PHONY prod: lint vite go
.PHONY build-all-prod: install lint prod

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
