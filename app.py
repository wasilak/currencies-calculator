import os
import time
import datetime
from dateutil.relativedelta import relativedelta, FR
import hashlib
import requests
from flask import Flask, render_template, jsonify, send_from_directory, session
from flask_caching import Cache

app = Flask(__name__)
app.secret_key = str(time.time())
cache = Cache(app, config={'CACHE_TYPE': 'filesystem', 'CACHE_DIR': './cache'})

today_date = datetime.datetime.now().strftime("%Y-%m-%d")

# check if weekend
weekno = datetime.datetime.today().weekday()
if weekno >= 5:
    # weekend
    request_date = datetime.datetime.now() + relativedelta(weekday=FR(-1))
    request_date = request_date.strftime("%Y-%m-%d")
else:
    # not weekend
    request_date = today_date


@app.route('/static/node_modules/<path:filename>')
def base_static(filename):
    return send_from_directory(app.root_path + '/node_modules/', filename)


@app.route('/', defaults={'path': ''}, methods=['GET'])
@app.route('/<path:path>', methods=['GET'])
def index(path):
    csrf = "%s-%s" % (os.getenv("CC_CSRF"), int(time.time()))
    csrf_hash = hashlib.md5(csrf.encode())
    csrf_token = csrf_hash.hexdigest()
    session["csrf"] = csrf_token
    return render_template('index.html', csrf_token=csrf_token, today_date=today_date, request_date=request_date)


@cache.cached(timeout=50, key_prefix='rates')
@app.route('/api/get/<csrf>/<force_download>/', defaults={'force_download': 0}, methods=['GET'])
def api_get(csrf, force_download):

    if "csrf" not in session or session["csrf"] != csrf:
        return jsonify({"error": True})

    response = requests.get("http://api.nbp.pl/api/exchangerates/tables/A/%s/?format=json" % request_date)

    data = response.json()
    return jsonify(data[0])
