const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

//função para verificar se o usuário está logado
const autenticacao = (req, res, next) => {
    //pegamos o valor do cookie
    const token = req.cookies.logado;
    //checamos se o jwt existe e verifico se esta correto
    if (token) {
        //comparar o token = token + secret + função 
        jwt.verify(token, 'api educacional da debora', (err, tokenDecodificado) => {
            //se nao conseguir decodificar o token
            if (err) {
                console.log(err.message);
                //é redirecionado para o login
                res.redirect('/login');
            }
            else {
                //console.log(tokenDecodificado);
                next();
            }
        });
    }
    //se nao estiver correto, é redirecionado
    else {
        res.redirect('/login');
    }
}

//Verificar o usuário
const verificarUsuario = (req, res, next) => {
    const token = req.cookies.logado;

    if (token) {
        //comparar o token = token + secret + função 
        jwt.verify(token, 'api educacional da debora', async (err, tokenDecodificado) => {
            //se nao conseguir decodificar o token
            if (err) {
                console.log(err.message);
                res.locals.usuario = null;
                next();
            }
            else {
                //procuramos o usuario com id correspondente
                const usuario = await Usuario.findById(tokenDecodificado.id);
                /* locals permite que uma pripriedade ou variavel seja
                acessivel pelas views */
                res.locals.usuario = usuario;

                if (usuario.usuario == 'administrador') {
                    res.locals.usuario.role = 'administrador';
                } else {
                    res.locals.usuario.role = 'usuario';
                }
                
                next();
            }
        });
    }
    else {
        res.locals.usuario = null;
        next();
    }
}


module.exports = { autenticacao, verificarUsuario };