#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sympy
from sympy.parsing.sympy_parser import parse_expr

import utils


def recorrer(request):
    #TODO permitir valores como pi en el desde y hasta
    res = utils.processRequest(request)
    results=[]
    if res.get("error"):
        results.append(res.get("error"))
        return results

    f=res.get("f")
    x=res.get("x")
    des=res.get("des")
    has=res.get("has")
    pas=res.get("pas")
    
    results.append([u"<h2>Valores para la función: "+utils.filterOut(f)+u"</h2>"])
    results.append([u"Se recorre la función variando 'x' de a: "+utils.filterOut(pas,3)+u" unidades."])
    i=des
    while i<=has:
        results.append([u"Para 'x' igual a "+utils.filterOut(i,3)+u", 'y' es igual a "+utils.filterOut(f.evalf(2,subs={x:i}),3)])
        i=i+pas
    return results