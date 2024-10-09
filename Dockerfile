FROM quay.io/wasilak/golang:1.23-alpine as builder

COPY . /app
WORKDIR /app
RUN apk add --update --no-cache yarn

ENV NODE_ENV=production

RUN yarn install
RUN yarn build
RUN mkdir -p ../dist
RUN CGO_ENABLED=0 go build -o /currencies-calculator

FROM scratch

COPY --from=builder /currencies-calculator .

ENTRYPOINT ["/currencies-calculator", "--listen=0.0.0.0:3000"]
