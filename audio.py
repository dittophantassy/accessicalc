#!/usr/bin/env python
# -*- coding: utf-8 -*-
import math, wave, array, time
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



def generateWav(f, des, has, saveFile = False):
    timeStart= time.time()
    duration = 5 # seconds
    freq = 220 # of cycles per second (Hz) (frequency of the sine waves)
    volume = 80 # percent
    sampleRate = 4410 # of samples per second (standard)
    numChan = 2 # of channels (1: mono, 2: stereo)
    dataSize = 2 # 2 bytes because of using signed short integers => bit depth = 16
    numSamplesPerCyc = int(sampleRate / freq)
    numSamples = sampleRate * duration * numChan
    valuesPerSecond = 88 # 10 function evaluations per second
    numValues = valuesPerSecond * duration

    data = array.array('h',[0 for i in xrange(numSamples)]) # signed short integer (-32768 to 32767) data

    function=sympy.sympify(f)
    x=sympy.Symbol('x')

    rangox=has-des

    #escalamos el volumen a bits
    amplification = 32767 * float(volume) / 100

    valores=array.array('d',[0 for i in xrange(numValues)]) #array de dobles para los valores de la function

    for i in xrange(numValues): #calculamos el valor de la funcion en el punto
        try:
            valor = (float(function.subs(x,(i/float(numValues)*rangox)+des)) ) 
        except TypeError, e:
            return ["Error: no se puede evaluar la función."]
        
        if valor == float("+inf"):
            valores[i] = max(valores)
        elif valor == float("-inf"):
            valores[i] = min(valores)
        else:
            valores[i]=valor

    minimo = min(valores)
    rangoy = max(valores) - minimo
    print min(valores),max(valores)


    for i in range(numSamples):
        j=i-i%2
        indexValor = int(j*(numValues/float(numSamples)))
        valor = valores[indexValor]

        if math.isnan(valor): #si no hay valor (como en una división por cero)
            if indexValor>0 and not math.isnan(valores[indexValor-1]):
                valor = valores[indexValor-1]
            elif indexValor<(numValues-1) and not math.isnan(valores[indexValor+1]):
                valor = valores[indexValor-1]
            else:
                valor = minimo

        if rangoy!=0:
            valorNormalizado = (valor-minimo)/rangoy # valor del 0 al 1 para multiplicar
        else: # en caso de que la función sea constante 
            valorNormalizado = .5

        #intentando modular la frecuencia
        valorMultiplicador=2**(valorNormalizado*6-3) #6 octavas de rango
        #sample = math.sin(math.pi * 2 * (i % numSamplesPerCyc)*valorMultiplicador)

        #modular la amplitud
        sample = math.sin(math.pi * 2 * (j % numSamplesPerCyc) / numSamplesPerCyc) * valorNormalizado
        #sample = (math.sin(math.pi * 2 * (j % numSamplesPerCyc) / numSamplesPerCyc)+math.sin(math.pi * 2.5 * (j % numSamplesPerCyc) / numSamplesPerCyc)+math.sin(math.pi * 3 * (j % numSamplesPerCyc) / numSamplesPerCyc))*valorNormalizado/3
        
        #lo amplificamos
        sample *= amplification

        #cross fade
        if i%2:
            sample *= i/float(numSamples)
        else:
            sample *= (numSamples-i)/float(numSamples)

        data[i]=int(sample)


    
    s = StringIO.StringIO()
    if saveFile:
        f = wave.open("hola.wav", 'w')
    else:
        f = wave.open(s, 'w')
        
    f.setparams((numChan, dataSize, sampleRate, numSamples, "NONE", "Uncompressed"))
    f.writeframes(data.tostring())
    s.seek(0)    

    if saveFile:
        f.close()
        print time.time()-timeStart    
    else:
        return {"audio": base64.b64encode(s.read())}
    


def audio(request):
    #TODO valuar en un punto
    #TODO permitir valores como pi en el desde y hasta
    res = utils.processRequest(request)
    results=[]
    if res.get("error"):
        results.append(res.get("error"))
        return results
    f=str(res.get("f"))
    des=float(res.get("des"))
    has=float(res.get("has"))

    print (f,des,has)
    results.append([u"<h2>Audigráfico para la función: "+utils.filterOut(f)+"</h2>"])
    
    results.append(generateWav(f,des,has))
    return results

if __name__ == "__main__":
    #generateWav("sin( 6.28+ 2 * sin(x) )",-3.14,3.14)
    generateWav("sin(x*y)",-10,10,True)
