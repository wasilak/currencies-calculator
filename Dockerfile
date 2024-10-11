FROM quay.io/wasilak/golang:1.23 AS builder

COPY . /app
WORKDIR /app

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt update && apt install -y npm yarn ca-certificates

ENV NODE_ENV=production

RUN yarn install
RUN yarn build
RUN mkdir -p ../dist
RUN CGO_ENABLED=0 go build -o /currencies-calculator

FROM scratch

COPY --from=builder /currencies-calculator .
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

ENV USER=root

ENTRYPOINT ["/currencies-calculator", "--listen=0.0.0.0:3000"]
