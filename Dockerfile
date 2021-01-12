FROM  --platform=$BUILDPLATFORM quay.io/wasilak/golang:1.15-alpine as builder

ARG TARGETPLATFORM
ARG BUILDPLATFORM

RUN apk add --update --no-cache yarn git

WORKDIR /go/src/git.wasil.org/wasilak/currencies-calculator/

RUN go get github.com/markbates/pkger/cmd/pkger

COPY --from=tonistiigi/xx:golang / /

COPY ./src .

RUN yarn install

RUN yarn run gulp

RUN pkger && go build .

FROM --platform=$BUILDPLATFORM quay.io/wasilak/alpine:3

COPY --from=builder /go/src/git.wasil.org/wasilak/currencies-calculator/currencies-calculator /currencies-calculator

CMD ["/currencies-calculator", "--listen=0.0.0.0:3000"]
