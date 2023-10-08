.PHONY dev: webpack go

webpack:
	@yarn build

go:
	@go build -o ./tmp/main .
