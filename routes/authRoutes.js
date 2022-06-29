const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

//cadastro
router.get('/cadastro', authController.cadastro_get);
router.post('/cadastro', authController.cadastro_post);
//login
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
//niveis de atividades
router.get('/atividades', authController.atividades_get);
//atividade facil
router.get('/facil', authController.facil_get);
router.post('/facil', authController.resposta_post);
//atividade dificil
router.get('/dificil', authController.dificil_get);
router.post('/dificil', authController.resposta_post);
//historico de atividades do usuario
router.get('/historico', authController.historico_get);
//dados do usuario
router.get('/dados', authController.dados_get);
router.post('/dados', authController.dados_post);
//logout
router.get('/logout', authController.logout_get);

/*
   administrador
*/
//historico de atividades dos usuarios
router.get('/historico-geral', authController.historicogeral_get);
router.post('/historico-geral', authController.historicogeral_post);
/*//lista de usuarios
router.get('/usuarios', authController.usuarios_get);
//lista de atividades de um usuario especifico
router.get('/historico-do-usuario', authController.historicousuario_get);*/

module.exports = router;