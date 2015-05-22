#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sympy
from sympy.parsing.sympy_parser import parse_expr


def filterOut(out,decimals=10):
    #TODO E,constants (pi,e), localization
    #TODO tokenize this
    # s=unicode(out)
    #to make floats look prettier
    try:
        s=(u"{:."+str(decimals)+"g}").format(float(out))
        s=s.replace("e"," por diez elevado a ")
        # s=unicode(float(out))
    except (ValueError,TypeError) as e:
        s=unicode(out)
        print e
        pass    
    s=s.replace("-"," menos ")
    s=s.replace("+"," mas ")
    s=s.replace("**"," elevado a ")
    s=s.replace("*"," por ")
    s=s.replace("/"," dividido ")
    s=s.replace("="," igual a ")
    s=s.replace(".",",")
    s=s.replace("sqrt"," raiz cuadrada de ")
    s=s.replace("  "," ")
    
    return s
    
def filterIn(ins):
    s=unicode(ins.lower())
    s=s.replace("^", "**")
    s=s.replace("sen", "sin")
    s=s.replace("y=","")
    s=s.replace("f(x)=","")
    return s


def processRequest(request):
    funcion = filterIn(request.get('funcion',""))
    desde = request.get('desde',"")
    hasta = request.get('hasta',"")
    paso = request.get('paso',"")
    punto = request.get('punto',"")
    
    res={}
    res["x"]=sympy.Symbol('x', real=True)
    
    try:
        res["f"]=parse_expr(funcion,{'x':res["x"]})
    except SyntaxError,error:
        res["error"]=u"<h2>La funcion no es válida: "+funcion+"</h2>"
        return res
    
    try:
        sympy.solve(res["f"], res["x"])
    except NotImplementedError:
        res["error"]=u"<h2>No existe la función: "+funcion+u"</h2>"
        return res
    
    if desde and hasta:
        try:
            res["des"]=float(desde)
        except (ValueError,TypeError) as e:
            res["error"]=u"<h2>Desde no es válido: " + desde + "</h2>"
            return res
        try:
            res["has"]=float(hasta)
        except (ValueError,TypeError) as e:
            res["error"]=u"<h2>Hasta no es válido: " + hasta + "</h2>"
            return res
        if res["has"]<=res["des"]:
            res["error"]=u"<h2>El valor 'Hasta' no es mayor que el valor 'Desde'</h2>"
            return res
    
    if paso:
        try:
            res["pas"]=float(paso)
        except (ValueError,TypeError) as e:
            res["error"]=u"<h2>Paso no es válido: " + paso + "</h2>"
            return res
    
        if res["pas"]<=0:
            res["error"]=u"<h2>Paso menor o igual que cero: " + paso + "</h2>"
            return res
        
    if punto:
        try:
            res["pun"]=float(punto)
        except (ValueError,TypeError) as e:
            res["error"]=u"<h2>El punto no es válido: " + punto + "</h2>"
            return res
    
    return res

    
    
if __name__=="__main__":
    print (filterOut(1.0,2))
    print (filterOut(1.919190,2))
    print (filterOut(0.010,2))
    print (filterOut(1.001,2))
    

