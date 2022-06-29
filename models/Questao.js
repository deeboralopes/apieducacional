const mongoose = require('mongoose');

const questaoSchema = new mongoose.Schema({
    nivel: {
        type: String
    },
    descricao: {
        type: String
    },
    resposta: {
        type: Number
    }
});


const Questao = mongoose.model('questao', questaoSchema);

module.exports = Questao;