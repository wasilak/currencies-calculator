FROM  quay.io/wasilak/golang:1.15-alpine as builder

WORKDIR /go/src/git.wasil.org/wasilak/currencies-calculator/

COPY ./src .

RUN apk add --update --no-cache yarn

RUN yarn install

RUN yarn run gulp

RUN go get github.com/GeertJohan/go.rice/rice

RUN rice embed-go && go build .

FROM quay.io/wasilak/alpine:3

COPY --from=builder /go/src/git.wasil.org/wasilak/currencies-calculator/currencies-calculator /currencies-calculator

CMD ["/currencies-calculator", "--listen=0.0.0.0:3000"]
