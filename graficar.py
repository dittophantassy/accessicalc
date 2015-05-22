#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sympy
from sympy.core import mul
from sympy.core import add
from sympy.core import power
from sympy.parsing.sympy_parser import parse_expr

import utils

def graficar(request):
     #TODO valuar en un punto
    #TODO permitir valores como pi en el desde y hasta
    res = utils.processRequest(request)
    if res.get("error"):
        return
    f=res.get("f")
    des=res.get("des")
    has=res.get("has")
    pas=res.get("pas")
    x=res.get("x")
    #por ahora usamos 11 pasos (10 intervalos)
    i=des
    results={}
    results["label"]=str(f)
    array=[]
    while i<=has:
        array.append([i,float(f.evalf(subs={x:i}))])
        i=i+pas
    results["data"]=array
    return results
