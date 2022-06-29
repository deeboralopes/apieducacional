const Usuario = require('../models/Usuario');
const Atividade = require('../models/Atividade');
const Questao = require('../models/Questao');

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcrypt');
var validator = require('validator');

const respostasHelper = require('../helpers/resposta');
const atividadesHelper = require('../helpers/atividade');

//Tratamento de erros
const erroCadastro = (err) => {
    //console.log(err.message, err.code);
    let erros = { usuario: '', email: '', senha:''};

    //erro de duplicação
    if(err.code === 11000) {
        if(err.message.includes('usuario_1 dup key')) {
            erros.usuario = 'O usuário já está sendo utilizado';
        }
        if(err.message.includes('email_1 dup key')) {
            erros.email = 'O e-mail já está sendo utilizado';
        }
    }

    // erros de validação
    if (err.message.includes('usuario validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            erros[properties.path] = properties.message;
        });
    };

    return erros;
}

const erroLogin = (err) => {
    //console.log(err.message, err.code);
    let erros = { usuario: '', senha:''};
   
    // erros de validação
    if (err.message.includes('O usuário não existe!')) {
        erros.usuario = 'O usuário não existe!';
    };

    if (err.message.includes('A senha está errada!')) {
        erros.senha = 'A senha está errada!';
    };

    if (err.message.includes('Insira o usuário e tente novamente!')) {
        erros.usuario = 'Insira o usuário e tente novamente!';
    };

    if (err.message.includes('Insira a senha e tente novamente!')) {
        erros.senha = 'Insira a senha e tente novamente!';
    };

    return erros;
}

const erroPesquisa = (err) => {
    //console.log(err.message, err.code);
    let erros = { pesquisa: ''};

    // erros de validação
    if (err.message.includes('Usuário não existe!')) {
        erros = 'Este usuário não existe!';
    };

    if (err.message.includes('Usuário não pode ser vazio!')) {
        erros = 'Usuário não pode ser vazio!';
    }

    return erros;
}


const erroEdicao = (err) => {
    //console.log(err.message, err.code);
    let erros = { email: '', senha:''};

    //console.log(err.message);

    //erro de duplicação
    if (err.message.includes('email_1 dup key')) {
        erros.email = 'O e-mail já está sendo utilizado';
    };

    //erro de duplicação
    if (err.message.includes('A senha não pode ser vazia!')) {
        erros.senha = 'A senha não pode ser vazia!';
    };

    if (err.message.includes('E-mail não pode ser vazio!')) {
        erros.email = 'E-mail não pode ser vazio!';
    }

    
    if (err.message.includes('E-mail inválido!')) {
        erros.email = 'E-mail inválido!';
    }

    return erros;
}


//CRIAÇÃO DO TOKEN JWT
const maxAge = 30 * 24 * 60 * 60;
const criarToken = (id) => { //id será utilizado no payload do jwt
    //objeto com atributos (payload) + segredo + objeto com opções
    return jwt.sign({ id }, 'api educacional da debora', {
        //espera tempo em segundos
        expiresIn: maxAge
    });
}


//CADASTRO
module.exports.cadastro_get = (req, res) => {
    res.render('cadastro');
}

module.exports.cadastro_post = async (req, res) => {
    //recebe o usuario pelo body
    const { usuario, email, senha } = req.body;

    try {
        //insere o usuario no banco
        /*const cargo = 'usuario';
        const user = await Usuario.create({ usuario, email, senha, cargo });*/
        const user = await Usuario.cadastro(usuario, email, senha);

        res.status(201).json({user: user._id});
    } 
    catch (err) {
        //console.log(err);
        //se houver erro, passa pela função que trata o erro
        const erros = erroCadastro(err);
        //console.log(erros);
        //emite o erro para ser apresentado na view
        res.status(400).json({ erros });
    }
}


//LOGIN
module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.login_post = async (req, res) => {
    const {usuario, senha} = req.body;

    if(usuario == '' || senha == ''){
        if (usuario == '' && senha == '') {
            const erro = new Error('Insira o usuário e tente novamente! Insira a senha e tente novamente!')
            const erros = erroLogin(erro);
            console.log(erros);
            res.status(400).json({ erros });
        } else

        if (usuario == '') {
            const erro = new Error('Insira o usuário e tente novamente!');
            const erros = erroLogin(erro);
            console.log(erros);
            res.status(400).json({ erros });
        } else

        if (senha == '') {
            const erro = new Error('Insira a senha e tente novamente!');
            const erros = erroLogin(erro);
            console.log(erros);
            res.status(400).json({ erros });
        }
    } else {
    
        try {
            //retorna o usuario caso encontre
            const user = await Usuario.login(usuario, senha);

            //criação do token para o login
            const token = criarToken(user._id);
            //colocar o token no cookie e enviar na resposta
            //nome do cookie + valor do token + atributos (tempo em ms) 
            res.cookie('logado', token, { maxAge: maxAge * 1000});
            
            res.status(200).json({user: user._id});
        }
        catch (err) {
            const erros = erroLogin(err);
            res.status(400).json({ erros });
        }
    }
}


//NIVEIS DE ATIVIDADE
module.exports.atividades_get = (req, res) => {
    res.render('atividades');
}


//ATIVIDADE FACIL
module.exports.facil_get = async (req, res) => {
    const questoes = await Questao.aggregate([{$match: {nivel: "facil"}},{$sample: {size: 5}}]);
    
    res.render('facil', {questoes: questoes});
}


//ATIVIDADE DIFICIL
module.exports.dificil_get = async (req, res) => {
    const questoes = await Questao.aggregate([{$match: {nivel: "dificil"}},{$sample: {size: 5}}]);
    res.render('dificil', {questoes: questoes});
}


//ENVIAR RESULTADO ATIVIDADE
module.exports.resposta_post = async (req, res) => {
    //pegamos o token que contem a informação do usuario
    const token = req.cookies.logado;
    //recebe atividade pelo body
    const { nivel, q1, q2, q3, q4, q5, r1, r2, r3, r4, r5 } = req.body;
    
    if (atividadesHelper.verificaCampos(nivel, q1, q2, q3, q4, q5, r1, r2, r3, r4, r5) == false){
        res.status(401).send('Envie todos os campos e tente novamente!');
    } else {
        try {
            var usuario = '';
            var erros = 0, acertos = 0;
        
            //função que descobre o nome do usuario
            function getUsuarioNome() {
                return new Promise(function (resolve, reject) {
                    if (token) {
                        //comparar o token = token + secret + função 
                        jwt.verify(token, 'api educacional da debora', async (err, tokenDecodificado) => {
                            //se nao conseguir decodificar o token
                            if (err) {
                                //console.log(err.message);
                            }
                            else {
                                const user= await Usuario.findById(tokenDecodificado.id);
                                var nomeusuario = user.usuario;
        
                                //retorna o nome do usuario para values
                                resolve(nomeusuario);
                            }
                        });
                    }
                })
            }

            //função que calcula os acertos e erros da atividade
            async function getAcertosErros() {
                const total = await respostasHelper.checarRespostas(q1, q2, q3, q4, q5, r1, r2, r3, r4, r5);
                erros = total.erros;
                acertos = total.acertos;
            }

            //função que insere a atividade no banco de dados
            async function insertAtividade(usuario) {
                //insere atividade no banco
                const atividade = await Atividade.create({ nivel, usuario, erros, acertos });
            }

            /* A promise garantirá que as outras funções aguardem a 
                execução da função getUsuarioNome, pois precisam dela
                para obter o nome do usuario para poder inserir a 
                atividade no banco de dados */
            Promise.all([getUsuarioNome()]).then(async function(values) {
                //recebe o nome do usuario dos valores da função
                usuario = values.join();
                //executa as funções seguintes
                await getAcertosErros();
                await insertAtividade(usuario);
            });

            //resposta para poder encaminhar o usuario p/ pagina atividades
            res.status(201).json({resposta: true});
            
        } 
        catch (err) {
            //const erros = erroAtividade(err);
            //console.log(err);
            res.status(400).send('Erro ao registrar atividade');
        }
    }
}


//HISTORICO DO USUARIO
module.exports.historico_get = (req, res) => {
    try {
        //pegamos o token que contem a informação do usuario
        const token = req.cookies.logado;
    
        //funcao que fornece o nome do usuario
        function getUsuarioNome() {
            return new Promise(function (resolve, reject) {
                if (token) {
                    //comparar o token = token + secret + função 
                    jwt.verify(token, 'api educacional da debora', async (err, tokenDecodificado) => {
                        //se nao conseguir decodificar o token
                        if (err) {
                            //console.log(err.message);
                        }
                        else {
                            const user= await Usuario.findById(tokenDecodificado.id);
                            var nomeusuario = user.usuario;
    
                            //retorna o nome do usuario para values
                            resolve(nomeusuario);
                        }
                    });
                }
            })
        }

        //funcao que busca as atividades do usuario
        async function getHistorico(usuario) {
            //busca historico de atividades
            const atividade = await Atividade.find({usuario: usuario});

            //juntamos os dados das atividades
            let totalAtividades = 0;
            let acertosFacil = 0;
            let errosFacil = 0;
            let acertosDificil = 0;
            let errosDificil = 0;

            Object.keys(atividade).forEach(function(posicao) {
                totalAtividades += 1;
                if (atividade[posicao].nivel == 'facil') {
                    acertosFacil += atividade[posicao].acertos;
                    errosFacil += atividade[posicao].erros;
                }
                if (atividade[posicao].nivel == 'dificil') {
                    acertosDificil += atividade[posicao].acertos;
                    errosDificil += atividade[posicao].erros;
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

            //renderiza a historico,ejs e envia as atividades e o resumo delas na resposta
            res.render('historico', {atividades: atividade, resumo: resumo});
        }

        //A promise garantirá a ordem da execução das funções
        Promise
        .all([getUsuarioNome()])
        .then(function(values) {
            //recebe o nome do usuario dos valores da função
            usuario = values.join();
            //executa as funções seguintes
            getHistorico(usuario);
        });

    } 
    catch (err) {
        //console.log(err.message);
        res.status(400).send('Erro ao buscar histórico de atividades');
    }
}


//DADOS DO USUARIO
module.exports.dados_get = (req, res) => {
    try {
        //pegamos o token que contem a informação do usuario
        const token = req.cookies.logado;
    
        //funcao que fornece o nome do usuario
        function getUsuarioNome() {
            return new Promise(function (resolve, reject) {
                if (token) {
                    //comparar o token = token + secret + função 
                    jwt.verify(token, 'api educacional da debora', async (err, tokenDecodificado) => {
                        //se nao conseguir decodificar o token
                        if (err) {
                            //console.log(err.message);
                        }
                        else {
                            //procura o usuario no banco de dados
                            const user= await Usuario.findById(tokenDecodificado.id);
                            //pega o nome do usuario
                            var nomeusuario = user.usuario;
                            //retorna o nome do usuario para values
                            resolve(nomeusuario);
                        }
                    });
                }
            })
        }

        //funcao que busca as atividades do usuario
        async function getDados(usuario) {
            //busca historico de atividades
            const dados = await Usuario.find({usuario: usuario});
            //renderiza a historico,ejs e envia as atividades na resposta
            res.render('dados', {dados: dados});
        }

        //A promise garantirá a ordem da execução das funções
        Promise
        .all([getUsuarioNome()])
        .then(function(values) {
            //recebe o nome do usuario dos valores da função
            usuario = values.join();
            //executa as funções seguintes
            getDados(usuario);
        });

    } 
    catch (err) {
        //console.log(err.message);
        res.status(400).send('Erro ao buscar dados do usuário');
    }
}

module.exports.dados_post = async (req, res) => {
    const { email, senha } = req.body;

    try {
        //pegamos o token que contem a informação do usuario
        const token = req.cookies.logado;
    
        //função que descobre o nome do usuario
        function getUsuarioNome() {
            return new Promise(function (resolve, reject) {
                if (token) {
                    //comparar o token = token + secret + função 
                    jwt.verify(token, 'api educacional da debora', async (err, tokenDecodificado) => {
                        //se nao conseguir decodificar o token
                        if (err) {
                            //console.log(err.message);
                        }
                        else {
                            const user= await Usuario.findById(tokenDecodificado.id);
                            var nomeusuario = user.usuario;
    
                            //retorna o nome do usuario para values
                            resolve(nomeusuario);
                        }
                    });
                }
            })
        }


        //funcao que edita o usuario
        async function editaUsuario(usuario, email, senha) {
            //se o email tiver sido mandado pela view
            if(email != null) {
                if( email != '') {
                    if (validator.isEmail(email)) {
                        //procura se ja existe usuario com o mesmo email
                        const emailutilizado = await Usuario.findOne({email: email});
                        //se houver
                        if (emailutilizado) {
                            //cria erro
                            const erro = new Error('email_1 dup key');
                            //passa erro pelo tratamento
                            const erros = erroEdicao(erro);
                            //emite o erro para ser exibido na view
                            res.status(400).json({ erros: erros });
                        } 
                        //se nao houver usuario com o mesmo email
                        else {
                            const newuser = await Usuario.editarEmail(usuario, email);
                            //emite o usuario atualizado para  view
                            res.status(200).json({usuario: newuser});
                        }
                    } else {
                        //cria erro
                        const erro = new Error('E-mail inválido!');
                        //passa erro pelo tratamento
                        const erros = erroEdicao(erro);
                        //emite o erro para ser exibido na view
                        res.status(400).json({ erros: erros });
                    }
                } else {
                    //cria erro
                    const erro = new Error('E-mail não pode ser vazio!');
                    //passa erro pelo tratamento
                    const erros = erroEdicao(erro);
                    //emite o erro para ser exibido na view
                    res.status(400).json({ erros: erros });
                }
            } 

            //se a senha tiver sido enviada da view
            if (senha != null) {
                if (senha  != ''){
                    const newuser = await Usuario.editarSenha(usuario, senha);
                                
                    //emite o usuario atualizado para a view
                    res.status(200).json({usuario: newuser});
                } else {
                    //cria erro
                    const erro = new Error('A senha não pode ser vazia!');
                    //passa erro pelo tratamento
                    const erros = erroEdicao(erro);
                    //emite o erro para ser exibido na view
                    res.status(400).json({ erros: erros });
                }
            }
        }

        /* A promise garantirá que as outras funções aguardem a 
                execução da função getUsuarioNome, pois precisam dela
                para obter o nome do usuario para poder inserir a 
                atividade no banco de dados */
        Promise.all([getUsuarioNome()]).then(async function(values) {
            //recebe o nome do usuario dos valores da função
            const usuario = values.join();
            //executa as funções seguintes
            await editaUsuario(usuario, email, senha);
        });
    }
    catch (err) {
        //console.log(err);
        //passa os erros pelo tratamento de erros
        const erros = erroEdicao(err);
        //emite os erros para a view
        res.status(400).json({ erros });
    }
}


//LOGOUT
module.exports.logout_get = (req, res) => {
    //vamos atribuir vazio ao cookie que confirma o login
    req.cookies.logado = '';
    res.cookie('logado', '', { maxAge: 1});
    //res.cookie('logado', '', {maxAge: 1});
    res.clearCookie('logado');
    res.redirect('/');
}

/*
    ADMINISTRADOR
*/

//HISTORICO GERAL
module.exports.historicogeral_get = async (req, res) => {
    try {
        //busca historico de atividades
        async function getAtividades() {
            return new Promise(async function (resolve, reject) {
                const atividades = await Atividade.find({}).lean().exec();
                resolve(atividades);
            });
        }

        //A promise garantirá a ordem da execução das funções
        Promise
        .all([getAtividades()])
        .then(function(values) {
            //recebe o nome do usuario dos valores da função
            const atividades = values;
            //renderiza a historico,ejs e envia as atividades e o resumo delas na resposta
             res.render('historicogeral', {atividades});
        });
    } 
    catch (err) {
        //console.log(err.message);
        res.status(400).send('Erro ao buscar histórico de atividades dos usuários');
    }
}

module.exports.historicogeral_post = async (req, res) => {
    //recebe nome de usuario pelo body
    const { usuario } = req.body;
    //procura pelo usuario no banco
    const usuarioEncontrado = await Usuario.findOne({ usuario: usuario }).lean().exec();
    //se o usuario tiver sido encontrado
    if (usuarioEncontrado) {
        try {    
            //procura atividades no banco
            const atividades = await Atividade.find({ usuario: usuarioEncontrado.usuario }).lean().exec();

            const resumo = atividadesHelper.gerarResumo(atividades);

            res.status(200).json({resumo});

        } catch (err) {
            res.status(400).send('Erro ao encontrar atividades do usuario pesquisado');
        }
    //senao tiver sido encontrado
    } else {
        var erro = '';
        if (usuario === '') {
            erro = new Error('Usuário não pode ser vazio!');
            
        } else {
            erro = new Error('Usuário não existe!');
        }
        const erros = erroPesquisa(erro);
        //emite o erro para ser exibido na view
        res.status(400).json({ erros: erros });
    }
}

