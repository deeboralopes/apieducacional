const Atividade = require('../models/Atividade');
const mongoose = require('mongoose');

module.exports.gerarResumo = (atividades) => {
    //juntamos os dados das atividades
    let totalAtividades = 0;
    let acertosFacil = 0;
    let errosFacil = 0;
    let acertosDificil = 0;
    let errosDificil = 0;

    Object.keys(atividades).forEach(function(posicao) {
        totalAtividades += 1;
        if (atividades[posicao].nivel == 'facil') {
            acertosFacil += atividades[posicao].acertos;
            errosFacil += atividades[posicao].erros;
        }
        if (atividades[posicao].nivel == 'dificil') {
            acertosDificil += atividades[posicao].acertos;
            errosDificil += atividades[posicao].erros;
        }
    });

    //atribuimos os dados a uma constante 
    const resumo = {
        total : totalAtividades,
        acertosFacil : acertosFacil,
        errosFacil : errosFacil,
        acertosDificil : acertosDificil,
        errosDificil : errosDificil
    };
    
    return resumo;
}

module.exports.verificaCampos = (nivel, q1, q2, q3, q4, q5, r1, r2, r3, r4, r5 ) => {

    if (nivel == '' || q1 =='' || q2 == '' || q3 == '' || q4 == '' || q5 == ''
    || r1 == '' || r2 == '' || r3 == '' || r4 == '' || r5 == '' || nivel == null 
    || q1 == null || q2 == null || q3 == null || q4 == null || q5 == null || 
    r1 == null || r2 == null || r3 == null || r4 == null || r5 == null ) {
        return false;
    }

    return true;
}