const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes.js');
const cookieParser = require('cookie-parser');
const { autenticacao, verificarUsuario } = require('./middleware/authMiddleware');
require('dotenv').config();

const express = require('express');
const app = express();

const swaggerDoc = require('./swagger.json');
const swaggerUi = require('swagger-ui-express');

//middlewares
app.use(express.static('public')); //utiliza arquivos estaticos da pasta public
app.use(express.static('views'));
app.use(express.json()); //utiliza json
app.use(cookieParser()); //envia cookies junto com objeto request do cliente

//view engines
app.set('view engine', 'ejs');

const password = process.env.PASSWORD;
const user = process.env.USER;

//conexão banco de dados
const dbURL = `mongodb+srv://${user}:${password}@cluster.vde4w.mongodb.net/test?retryWrites=true&w=majority`;
mongoose.connect(dbURL, { useUnifiedTopology: true })
    .then ((res) => app.listen(3000))
    .catch((err) => console.log(err));

//rotas
app.get('/logout');
app.get('*', verificarUsuario);
app.get('/', (req, res) => res.render('home'));
app.get('/atividades', autenticacao, (req, res) => res.render('atividades'));
app.get('/dificil', autenticacao/*, (req, res) => res.render('dificil')*/);
app.get('/facil', autenticacao/*, (req, res) => res.render('facil')*/);
app.get('/dados', autenticacao/*, (req, res) => res.render('dados')*/);
app.get('/historico', autenticacao/*, (req, res) => res.render('historico')*/);
app.get('/historico-geral', autenticacao);

app.use('/documentacao', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use(authRoutes);

module.exports = app;


//COOKIES
/*
app.get('/set-cookies', (req, res) => {
    //quando enviarmos a resposta o cookie será incluido
    //res.setHeader('Set-Cookie', 'novoUsuario=true'); //header + valor do cookie (nome + valor)

    res.cookie('logado', true, { maxAge: 1000 * 60 * 60 * 24 * 30, httOnly: true}); //cookie expirara em 30 dias

    res.send('Cookies sairam do forninho!')
});*/

/*app.get('/read-cookies', (req, res) => {

    const cookies = req.cookies;
    //console.log(cookies);
    
    res.json(cookies);
});*/