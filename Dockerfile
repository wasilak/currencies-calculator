# ARG TARGETPLATFORM
# ARG BUILDPLATFORM

# FROM --platform=${BUILDPLATFORM} quay.io/wasilak/golang:1.16-alpine as builder

# ARG GOOS
# ARG GOARCH

# RUN apk add --update --no-cache yarn

# WORKDIR /src/currencies-calculator/

# COPY ./src .

# RUN yarn install

# RUN yarn run gulp

# RUN go build .

# FROM --platform=${BUILDPLATFORM} quay.io/wasilak/alpine:3

# COPY --from=builder /src/currencies-calculator/currencies-calculator /currencies-calculator

# CMD ["/currencies-calculator", "--listen=0.0.0.0:3000"]

ARG TARGETPLATFORM
ARG BUILDPLATFORM

FROM --platform=${BUILDPLATFORM} quay.io/wasilak/alpine:3

ARG GOOS
ARG GOARCH

ADD ./dist/currencies-calculator-$GOOS-$GOARCH /currencies-calculator

CMD ["/currencies-calculator", "--listen=0.0.0.0:3000"]
