#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sympy
from sympy.core import mul
from sympy.core import add
from sympy.core import power
from sympy.parsing.sympy_parser import parse_expr

import utils

def valuar(request):
    res = utils.processRequest(request)
    results=[]
    if res.get("error"):
        results.append(res.get("error"))
        return results
    if not res.get("pun") and res.get("pun")!=0.0:
        results.append(u"<h2>No ha ingresado un punto.</h2>")
        return results

    f=res.get("f")
    x=res.get("x")
    pun=res.get("pun")
    results.append([u"<h2>Valor para la función: "+utils.filterOut(f)+"</h2>"])
    results.append(["Para 'x' igual a "+utils.filterOut(pun,3)+", 'y' es igual a "+utils.filterOut(f.evalf(2,subs={x:pun}),3)])
    return results
