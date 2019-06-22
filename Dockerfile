FROM python:3-alpine

ARG TIMEZONE=Europe/Warsaw

COPY . /app

ENV FLASK_ENV=production
ENV FLASK_RUN_PORT=5000
ENV FLASK_DEBUG=False
ENV FLASK_APP=app.py

RUN apk add --update --no-cache yarn

WORKDIR /app

RUN yarn install

RUN pip install -U pip
RUN pip install -r requirements.txt

RUN yarn run gulp

RUN apk --update --no-cache add tzdata \
    && cp /usr/share/zoneinfo/${TIMEZONE} /etc/localtime \
    && echo "${TIMEZONE}" > /etc/timezone \
    && apk del tzdata

CMD ["flask", "run", "--host=0.0.0.0" ,"--with-threads", "--eager-loading"]
