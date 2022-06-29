const mongoose = require('mongoose');

const atividadeSchema = new mongoose.Schema({
    nivel: {
        type: String,
        required: [true, 'O nivel da atividade nao foi enviado'],
        lowercase: true
    },
    usuario: {
        type: String,
        required: [true, 'O usuario da atividade nao foi enviado'],
        lowercase: true
    },
    erros: {
        type: Number,
        required: [true, 'Os erros da atividade nao foram enviados']
    },
    acertos: {
        type: Number,
        required: [true, 'Os acertos da atividade nao foram enviados']
    }
});

//Metodo estatico para buscar historico de atividades
/* atividadeSchema.statics.historicousuario = async function (usuario) {
    let historico = await Atividade.find({ usuario });;

    if (historico) {
        return historico;
    }
    //caso nada seja encontrado
    throw Error('Nada encontrado!');
} */

const Atividade = mongoose.model('atividade', atividadeSchema);

module.exports = Atividade;