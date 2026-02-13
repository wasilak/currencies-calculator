FROM quay.io/wasilak/golang:1.26 AS builder

COPY . /app
WORKDIR /app

# for debian trixie: replaced apt-key add with gpg --dearmor
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor -o /usr/share/keyrings/yarn-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/yarn-archive-keyring.gpg] https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt update && apt install -y npm yarn ca-certificates

ENV CGO_ENABLED=0
RUN make build-all-prod

FROM scratch

COPY --from=builder /app/tmp/main /currencies-calculator
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

ENV USER=root

ENTRYPOINT ["/currencies-calculator", "--listen=0.0.0.0:3000"]
