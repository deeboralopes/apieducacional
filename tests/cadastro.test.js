const express = require('express');
const request = require('supertest');

const app = require('./appTest.js');

describe('CADASTRO', () => {
    // SÓ UTILIZAR ESTE UMA VEZ E ALTERAR OS DADOS
    /* it('Retorna 201 se os dados forem validos', async () => {
        const res = await request(app)
                            .post('/cadastro')
                            .send({usuario: 'caique', email:'caique@caique.com', senha: 'caique'})
                            .expect(201);
    }); */

    it('Retorna 400 porque o usuario é pequeno', async () => {
        const res = await request(app)
                            .post('/cadastro')
                            .send({usuario: '123', email:'jorge@jorge.com', senha: 'jorginho'})
                            .expect(400);
        expect(res.body.erros).toMatchObject({"usuario": "O usuário deve conter pelo menos 4 caracteres", 
                                                "email": "", 
                                                "senha": ""});
    }); 

    it('Retorna 400 porque o email é invalido', async () => {
        const res = await request(app)
                            .post('/cadastro')
                            .send({usuario: 'jorge', email:'jorge', senha: 'jorginho'})
                            .expect(400);
        expect(res.body.erros).toMatchObject({"usuario": "", 
                                                "email": "Por favor insira um e-mail válido", 
                                                "senha": ""});
    });

    it('Retorna 400 porque a senha é pequena', async () => {
        const res = await request(app)
                            .post('/cadastro')
                            .send({usuario: 'jorge', email:'jorge@jorge.com', senha: '12345'})
                            .expect(400);
        expect(res.body.erros).toMatchObject({"usuario": "", 
                                                "email": "", 
                                                "senha": "A senha deve conter pelo menos 6 caracteres"});
    });

    it('Retorna 400 porque não há usuario', async () => {
        const res = await request(app)
                            .post('/cadastro')
                            .send({usuario: '', email:'jorge@jorge.com', senha: 'jorginho'})
                            .expect(400);
        expect(res.body.erros).toMatchObject({"usuario": "Insira o usuário e tente novamente", 
                                                "email": "", 
                                                "senha": ""});
    });

    it('Retorna 400 porque não há email', async () => {
        const res = await request(app)
                            .post('/cadastro')
                            .send({usuario: 'jorge', email:'', senha: 'jorginho'})
                            .expect(400);
        expect(res.body.erros).toMatchObject({"usuario": "", 
                                                "email": "Insira o e-mail e tente novamente", 
                                                "senha": ""});
    });

    it('Retorna 400 porque não há senha', async () => {
        const res = await request(app)
                            .post('/cadastro')
                            .send({usuario: 'jorge', email:'jorge@jorge.com', senha: ''})
                            .expect(400);
        expect(res.body.erros).toMatchObject({"usuario": "", 
                                                "email": "", 
                                                "senha": "Insira a senha e tente novamente"});
    });

    it('Retorna 400 porque o usuario já existe', async () => {
        const res = await request(app)
                            .post('/cadastro')
                            .send({usuario: 'debora', email:'jorge@jorge.com', senha: 'jorginho'})
                            .expect(400);
        expect(res.body.erros).toMatchObject({"usuario": "O usuário já está sendo utilizado", 
                                                "email": "", 
                                                "senha": ""});
    });

    it('Retorna 400 porque o email já existe', async () => {
        const res = await request(app)
                            .post('/cadastro')
                            .send({usuario: 'jorge', email:'debora@debora.com', senha: 'jorginho'})
                            .expect(400);
        expect(res.body.erros).toMatchObject({"usuario": "", 
                                                "email": "O e-mail já está sendo utilizado", 
                                                "senha": ""});
    });

    jest.setTimeout(30000);
});

