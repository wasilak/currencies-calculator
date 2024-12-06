FROM quay.io/wasilak/golang:1.23 AS builder

COPY . /app
WORKDIR /app

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt update && apt install -y npm yarn ca-certificates

ENV CGO_ENABLED=0
RUN make build-all-prod

FROM scratch

COPY --from=builder /app/tmp/main /currencies-calculator
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

ENV USER=root

ENTRYPOINT ["/currencies-calculator", "--listen=0.0.0.0:3000"]
