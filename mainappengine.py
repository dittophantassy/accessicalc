#!/usr/bin/env python
# -*- coding: utf-8 -*-
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
import json

import audio
import analisis
import valuar
import recorrer
import graficar

class Home(webapp.RequestHandler):
    def get(self):
        self.response.write(template.render("static/index.html",{}))
        
class AnalisisForm(webapp.RequestHandler):
    def get(self):
        self.response.write(template.render("static/analisis.html",{}))
        
class AudioForm(webapp.RequestHandler):
    def get(self):
        self.response.write(template.render("static/audio.html",{}))

class RecorrerForm(webapp.RequestHandler):
    def get(self):
        self.response.write(template.render("static/recorrer.html",{}))
        
class CalculadoraForm(webapp.RequestHandler):
    def get(self):
        self.response.write(template.render("static/calculadora.html",{}))
                

def classer(func):
    class cl(webapp.RequestHandler):
        def get(self):
            self.response.write(json.dumps({"results":func(self.request)}))
    return cl

app = webapp.WSGIApplication([('/', Home),
                              ('/analisisform', AnalisisForm),
                              ('/audioform', AudioForm),
                              ('/recorrerform', RecorrerForm),
                              ('/calculadoraform', CalculadoraForm),
                              ('/analisis', classer(analisis.analisis)),
                              ('/recorrer', classer(recorrer.recorrer)),
                              ('/audio', classer(audio.audio)),
                              ('/valuar', classer(valuar.valuar)),
                              ('/graficar', classer(graficar.graficar)),
                              ],
                                     debug = True)
run_wsgi_app(app)
