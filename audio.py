#!/usr/bin/env python
# -*- coding: utf-8 -*-
import math, wave, array
import sympy
import StringIO
import base64
from sympy.parsing.sympy_parser import parse_expr
import ast

import utils


def safeEval(s,x):
    tree = ast.parse(s, mode='eval')
    whitelist = (ast.Expression, ast.Call, ast.Name, ast.Load,
             ast.BinOp, ast.UnaryOp, ast.operator, ast.unaryop, ast.cmpop,
             ast.Num,
            )
    locs={v:getattr(math, v)
        for v in filter(lambda x: not x.startswith('_'), dir(math))
    }
    locs["x"]=x
    valid = all(isinstance(node, whitelist) for node in ast.walk(tree))
    if valid:
        return eval(compile(tree, filename='', mode='eval'),
                  {"__builtins__": None},locs )





def generateWav(f,des,has):
    duration = 5 # seconds
    freq = 880 # of cycles per second (Hz) (frequency of the sine waves)
    volume = 100 # percent
    data = array.array('h') # signed short integer (-32768 to 32767) data
    sampleRate = 4410 # of samples per second (standard)
    numChan = 2 # of channels (1: mono, 2: stereo)
    dataSize = 2 # 2 bytes because of using signed short integers => bit depth = 16
    numSamplesPerCyc = int(sampleRate / freq)
    numSamples = sampleRate * duration * numChan
    
    #des=-2
    #has=2
    x=sympy.Symbol('x', real=True)
    #f=parse_expr("(x*x)",{'x':x})
    
    rangox=has-des
    minimo=float(f.evalf(subs={x:des}))
    maximo=float(f.evalf(subs={x:des}))

    valores=[]
    for i in range(numSamples):
        #valores.append(float(f.evalf(subs={x:((i/float(numSamples))*rangox)+des})))
        if i%2:
            valores.append(float(f.evalf(subs={x:((i/float(numSamples))*rangox)+des}))  *(i/float(numSamples)))
        else:
            valores.append(float(f.evalf(subs={x:((i/float(numSamples))*rangox)+des}))  *((numSamples-i)/float(numSamples)))
                       
        #print (i,valores[i],(i/float(numSamples))*rangox)
        if valores[i]>maximo:
            maximo=valores[i]
        if valores[i]<minimo:
            minimo=valores[i]
    
    rangoy=maximo-minimo
    print (rangoy)
    for i in range(numSamples):
        
        sample = 32767 * float(volume) / 100
        sample *= math.sin(math.pi * 2 * (i % numSamplesPerCyc) / numSamplesPerCyc)
        sample *= valores[i]/rangoy
        data.append(int(sample))
        
    #f = wave.open('SineWave_' + str(freq) + 'Hz.wav', 'w')
    s = StringIO.StringIO()
    f = wave.open(s, 'w')
    f.setparams((numChan, dataSize, sampleRate, numSamples, "NONE", "Uncompressed"))
    f.writeframes(data.tostring())
    #print (dir(f))
    #print (dir(s))
    s.seek(0)
    #print ("data:audio/wav;base64," + base64.b64encode(s.read()) )
    return base64.b64encode(s.read())
    #f.close()


def audio(request):
    #TODO valuar en un punto
    #TODO permitir valores como pi en el desde y hasta
    res = utils.processRequest(request)
    results=[]
    if res.get("error"):
        results.append(res.get("error"))
        return results
    f=res.get("f")
    des=res.get("des")
    has=res.get("has")

    results.append([u"<h2>Audigráfico para la función: "+utils.filterOut(f)+"</h2>"])
    
    results.append({"audio":generateWav(f,des,has)})
    return results

