#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sympy
from sympy.core import mul
from sympy.core import add
from sympy.core import power

from sympy.parsing.sympy_parser import parse_expr

import utils

def analisis(request):
    res = utils.processRequest(request)
    results=[]
    if res.get("error"):
        results.append(res.get("error"))
        return results
    
    f=res.get("f")
    x=res.get("x")
    
    results.append([u"<h2>Análisis de la función: "+utils.filterOut(f)+"</h2>"])
    if type(f) in [sympy.functions.elementary.trigonometric.sin,sympy.functions.elementary.trigonometric.cos,sympy.functions.elementary.trigonometric.tan]:
        results.append([u"Función de tipo trigonométrica"])
    if type(f) in [sympy.functions.elementary.trigonometric.asin,sympy.functions.elementary.trigonometric.acos,sympy.functions.elementary.trigonometric.atan]:
        results.append([u"Función de tipo trigonométrica inversa"])
    if type(f) in [sympy.functions.elementary.hyperbolic.sinh,sympy.functions.elementary.hyperbolic.cosh,sympy.functions.elementary.hyperbolic.tanh]:
        results.append([u"Función de tipo hiperbólica"])
    if type(f) in [sympy.functions.elementary.hyperbolic.asinh,sympy.functions.elementary.hyperbolic.acosh,sympy.functions.elementary.hyperbolic.atanh]:
        results.append([u"Función de tipo hiperbólica inversa"])
    
    elif type(f) is sympy.functions.elementary.exponential.log:
        results.append([u"Función de tipo logarítmica"])
    elif type(f) is sympy.functions.elementary.exponential.exp:
        results.append([u"Función de tipo exponencial"])
        
    elif issubclass(type(f), mul.Mul):
        results.append([u"Función de tipo multiplicación de funciones"])
    elif issubclass(type(f), add.Add):
        results.append([u"Función de tipo suma de funciones"])
        
    elif issubclass(type(f), power.Pow):
        results.append([u"Función de tipo potencia"])            
        
    nraices=0
    raices=[]
    
    for i in sympy.solve(f, x,rational=False):
        nraices=nraices+1
        raices.append([u"La función tiene raíz en: "+utils.filterOut(i)])
   
    if raices:
        results.append(u"La función tiene " + str(nraices)+u" raices")
        results=results+raices
    
    results.append(u"La función tiene una ordenada al origen en: 0, " + str(f.evalf(subs={x:0})))
    print "ordenada al origen", f.evalf(subs={x:0})
    dev1=f.diff(x)
    print "primera derivada",dev1
    dev2=dev1.diff(x)
    print "segunda derivada",dev2
    
    for i in sympy.solve(dev1, x,rational=False):
        print "una raiz",i
        if dev2.evalf(subs={x:i}) < 0:
            results.append([u"La función tiene un máximo local en: 'x' igual a "+utils.filterOut(i,3)+", 'y' es igual a "+utils.filterOut((f.evalf(2,subs={x:i})),3)])
        else:
            results.append([u"La función tiene un mínimo local en: 'x' igual a "+utils.filterOut(i,3)+", 'y' es igual a "+utils.filterOut((f.evalf(2,subs={x:i})),3)])
    
    results.append(["Primera derivada: "+utils.filterOut(dev1)])
    results.append([u"Segunda derivada: "+utils.filterOut(dev2)])
    results.append([u"Tercera derivada: "+utils.filterOut(dev2.diff(x))])
    
    return results
