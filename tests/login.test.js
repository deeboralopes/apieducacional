const express = require('express');
const request = require('supertest');

const app = require('./appTest.js');

describe('LOGIN', () => {

    it('Retorna 201 se os dados forem validos', async () => {
        const res = await request(app)
                            .post('/login')
                            .send({usuario: 'maria', senha: 'mariazinha'})
                            .expect(200);
    });

    it('Retorna 400 porque o usuario não existe', async () => {
        const res = await request(app)
                            .post('/login')
                            .send({usuario: 'jandira', senha: 'jandira'})
                            .expect(400);
        expect(res.body.erros).toMatchObject({"usuario": "O usuário não existe!", 
                                                "senha": ""});
    }); 

    it('Retorna 400 porque a senha está incorreta', async () => {
        const res = await request(app)
                            .post('/login')
                            .send({usuario: 'debora', senha: 'senhaqualquer'})
                            .expect(400);
        expect(res.body.erros).toMatchObject({"usuario": "", 
                                                "senha": "A senha está errada!"});
    });

    it('Retorna 400 porque não há senha e usuario', async () => {
        const res = await request(app)
                            .post('/login')
                            .send({usuario: '', senha: ''})
                            .expect(400);
        expect(res.body.erros).toMatchObject({"usuario": "Insira o usuário e tente novamente!", 
                                                "senha": "Insira a senha e tente novamente!"});
    });

    it('Retorna 400 porque não há usuario', async () => {
        const res = await request(app)
                            .post('/login')
                            .send({usuario: '', senha: 'senhaqualquer'})
                            .expect(400);
        expect(res.body.erros).toMatchObject({"usuario": "Insira o usuário e tente novamente!", 
                                                "senha": ""});
    });

    it('Retorna 400 porque não há senha', async () => {
        const res = await request(app)
                            .post('/login')
                            .send({usuario: 'usuario', senha: ''})
                            .expect(400);
        expect(res.body.erros).toMatchObject({"usuario": "", 
                                                "senha": "Insira a senha e tente novamente!"});
    });

    jest.setTimeout(30000);
});