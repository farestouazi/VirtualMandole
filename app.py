from flask import Flask, render_template, redirect, request, jsonify, session, url_for

app = Flask(__name__)
app.secret_key = 'mandolekan'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/play')
def play():
    return render_template('play.html')

@app.route('/tunner')
def tunner():
    return render_template('tunner.html')

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=7777, debug=True)