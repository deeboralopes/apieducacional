const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const usuarioSchema = new mongoose.Schema({
    usuario: {
        type: String,
        //caso o usuario não seja inserido, sera enviada uma mensagem de erro
        required: [true, 'Insira o usuário e tente novamente'],
        unique: true,
        //caso o tamanho do usurio seja menor que 4, emitira erro
        minlength: [4, 'O usuário deve conter pelo menos 4 caracteres'],
        lowercase: true
    },
    email: {
        type: String,
        //caso o email não seja inserido, sera enviada uma mensagem de erro
        required: [true, 'Insira o e-mail e tente novamente'],
        unique: true,
        lowercase: true,
        //verifica se é um email
        validate: [isEmail, 'Por favor insira um e-mail válido']
    },
    senha: {
        type: String,
        //caso a senha não seja inserida, sera enviada uma mensagem de erro
        required: [true, 'Insira a senha e tente novamente'],
        //caso o tamanho da senha seja menor que 6, emitira erro
        minlength: [6, 'A senha deve conter pelo menos 6 caracteres']
    },
    cargo: {
        type: String
    }
});

//executa função antes do doc ser salvo no banco de dados
usuarioSchema.pre('save', async function (next) {
    //definimos o incremento antes da criptografia, para melhora-la
    const incremento = await bcrypt.genSalt();
    //encriptamos a senha + incremento
    this.senha = await bcrypt.hash(this.senha, incremento);
    next();
});

/*
//executa função após doc ser salvo no banco de dados
usuarioSchema.post('save', function (doc, next){
    console.log('usuario foi criado e salvo', doc);
    //next() possibilita receber uma resposta
    next();
});
*/

//Metodo estatico para login
usuarioSchema.statics.login = async function (usuario, senha) {
    //procurar se o usuario existe no banco de dados
    const user = await Usuario.findOne({ usuario });
    //caso exista
    if (user) {
        //comparando as senhas, brcrypt ira desfazer o hash para comparar
        const auth = await bcrypt.compare(senha, user.senha);
        if (auth) {
            return user;
        }
        //caso a senha não seja igual
        throw Error('A senha está errada!');
    }
    //caso não exista
    throw Error('O usuário não existe!');
}

//Metodo estático para o cadastro
usuarioSchema.statics.cadastro = async function(usuario, email, senha) {
    //insere o usuario no banco
    const cargo = 'usuario';
    const user = await Usuario.create({ usuario, email, senha, cargo });

    return user;
}

//Método estático para edição de email
usuarioSchema.statics.editarEmail = async function(usuario, email) {
    const user = await Usuario.findOne({usuario: usuario});
    //atualiza o email do usuario
    await Usuario.updateOne({"usuario": user.usuario}, {$set:{"email": email}});
    //procura o usuario atualizado
    const newuser = await Usuario.findOne({usuario: usuario});

    return newuser;
}

//Método estático para edição de senha
usuarioSchema.statics.editarSenha = async function(usuario, senha) {
    //procura o usuario no banco de dados
    const user = await Usuario.findOne({usuario: usuario});
    const password = senha;

    /*---------------------------------------------------------
    *** ENCRIPTAR A SENHA PARA ENVIAR PARA O BANCO DE DADOS
    ----------------------------------------------------------*/
    //definimos o incremento antes da criptografia, para melhora-la
    const incremento = await bcrypt.genSalt();
    //encriptamos a senha + incremento
    const senhaencriptada = await bcrypt.hash(password, incremento);
    /*----------------------------------------------------------*/

    //atualiza o usuario
    await Usuario.updateOne({"usuario": user.usuario}, {$set:{"senha": senhaencriptada}});
    //pega o usuario com dados atualizados
    const newuser = await Usuario.findOne({usuario: usuario});

    return newuser;
}

const Usuario = mongoose.model('usuario', usuarioSchema);

module.exports = Usuario;