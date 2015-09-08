function filterIn(s) {
    s=s.toLowerCase();
    s=s.replace(/seno/,"sin");
    s=s.replace(/sen/,"sin");
    s=s.replace(/\*\*/,"^");
    
    return s;
}

function filterOut(s) {
    s=s.replace(/-/," menos ");
    s=s.replace(/\+/," mas ");
    s=s.replace(/\*\*/," elevado a la ");
    s=s.replace(/\^/," elevado a la ");
    s=s.replace(/\*/," por ");
    s=s.replace(/\//," dividido ");
    s=s.replace(/=/," igual a ");
    s=s.replace(/\./,",");
    s=s.replace(/sqrt/," raiz cuadrada de ");
    s=s.replace(/  /," ");

    return s
}

//console.log(filterOut("2+2^18"))