FROM quay.io/wasilak/golang:1.21-alpine as builder

ADD . /app
WORKDIR /app
RUN apk add --update --no-cache yarn

ENV NODE_ENV=production

RUN yarn install
RUN yarn build
RUN mkdir -p ../dist
RUN go build -o /currencies-calculator

FROM quay.io/wasilak/alpine:3

COPY --from=builder /currencies-calculator /currencies-calculator

ENTRYPOINT ["/currencies-calculator", "--listen=0.0.0.0:3000"]
