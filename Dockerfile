FROM quay.io/wasilak/golang:1.17-alpine as builder

ADD . /app
WORKDIR /app/src
RUN mkdir -p ../dist
RUN go build -o ../dist/currencies-calculator

FROM quay.io/wasilak/alpine:3

COPY --from=builder /app/dist/currencies-calculator /currencies-calculator

CMD ["/currencies-calculator", "--listen=0.0.0.0:3000"]
