from flask import Flask, request, session, g, redirect, url_for, jsonify
import random, threading, webbrowser

import recorrer
import audio
import graficar
import analisis
import valuar

# create our little application :)
app = Flask(__name__,static_folder='static', static_url_path='')

@app.route("/")
def index():
    return redirect("/index.html")

@app.route("/recorrerform")
def recorrerform():
    return redirect("/recorrer.html")

def jsonResponse(func):
    def resp():
        return jsonify(results=func(request.args))
    return resp
    

app.add_url_rule("/recorrer","recorrer",jsonResponse(recorrer.recorrer))

app.add_url_rule("/valuar","valuar",jsonResponse(valuar.valuar))

app.add_url_rule("/graficar","graficar",jsonResponse(graficar.graficar))

@app.route("/audioform")
def audioform():
    return redirect("/audio.html")

app.add_url_rule("/audio","audio",jsonResponse(audio.audio))

@app.route("/analisisform")
def anailisiform():
    return redirect("/analisis.html")

app.add_url_rule("/analisis","analisis",jsonResponse(analisis.analisis))

@app.route("/calculadoraform")
def calculadoraform():
    return redirect("/calculadora.html")



if __name__ == '__main__':

    #port = 5000 + random.randint(0, 999)
    port = 41495 #random rarely used port
    url = "http://127.0.0.1:{}".format(port)
    
    threading.Timer(2, lambda: webbrowser.open(url) ).start()
    
    app.run(port=port, debug=False)
    