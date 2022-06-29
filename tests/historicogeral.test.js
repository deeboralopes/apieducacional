const express = require('express');
const request = require('supertest');

const app = require('./appTest.js');

describe('HISTÓRICO GERAL', () => {

    it('Retorna 201 se o usuario existir', async () => {
        const res = await request(app)
                            .post('/historico-geral')
                            .send({usuario: 'maria'})
                            .expect(200);
        expect(res.body.resumo).toMatchObject({
                                            "total": 0,
                                            "acertosFacil": 0,
                                            "errosFacil": 0,
                                            "acertosDificil": 0,
                                            "errosDificil": 0
                                        });
    });

    it('Retorna 400 se o usuario for vazio', async () => {
        const res = await request(app)
                            .post('/historico-geral')
                            .send({usuario: ''})
                            .expect(400);
        expect(res.body.erros).toEqual("Usuário não pode ser vazio!");
    });

    it('Retorna 400 se o usuario não existir', async () => {
        const res = await request(app)
                            .post('/historico-geral')
                            .send({usuario: 'maria cecilia'})
                            .expect(400);
        expect(res.body.erros).toEqual("Este usuário não existe!");
    });

    jest.setTimeout(30000);
});