ARG TARGETPLATFORM
ARG BUILDPLATFORM

FROM --platform=${BUILDPLATFORM} quay.io/wasilak/alpine:3

ARG GOOS
ARG GOARCH

ADD ./dist/currencies-calculator-$GOOS-$GOARCH /currencies-calculator

CMD ["/currencies-calculator", "--listen=0.0.0.0:3000"]
