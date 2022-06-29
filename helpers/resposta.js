const Questao = require('../models/Questao');
const mongoose = require('mongoose');

module.exports.checarRespostas = async (q1, q2, q3, q4, q5, r1, r2, r3, r4, r5) => {
    const r1_ID = mongoose.Types.ObjectId(r1.trim());
    const questao1 = await Questao.findOne({_id: r1_ID});
    const resposta1 = questao1.resposta;

    const r2_ID = mongoose.Types.ObjectId(r2.trim());
    const questao2 = await Questao.findOne({_id: r2_ID});
    const resposta2 = questao2.resposta;

    const r3_ID = mongoose.Types.ObjectId(r3.trim());
    const questao3 = await Questao.findOne({_id: r3_ID});
    const resposta3 = questao3.resposta;

    const r4_ID = mongoose.Types.ObjectId(r4.trim());
    const questao4 = await Questao.findOne({_id: r4_ID});
    const resposta4 = questao4.resposta;

    const r5_ID = mongoose.Types.ObjectId(r5.trim());
    const questao5 = await Questao.findOne({_id: r5_ID});
    const resposta5 = questao5.resposta;

    var erros = 0;
        
    erros = (parseInt(q1) == resposta1) ? erros : erros+1;
    erros = (parseInt(q2) == resposta2) ? erros : erros+1;
    erros = (parseInt(q3) == resposta3) ? erros : erros+1;
    erros = (parseInt(q4) == resposta4) ? erros : erros+1;
    erros = (parseInt(q5) == resposta5) ? erros : erros+1;

    const acertos = 5 - erros;

    const total = {
        acertos: acertos,
        erros: erros
    }

    return total;
}