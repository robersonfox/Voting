const { expect } = require('chai');
const app = require('../app/src/index');

const supertest = require('supertest');
const request = supertest(app);

const memberId = "07804769644";
let session;
let member;

describe('API de Votação', function () {
    it('Deve criar uma sessão de votação', async function () {
        // Crie uma nova sessão de votação

        const data = {
            nome: "Comprar mantimentos",
            descricao: "Pauta descricao"
        };

        session = await request
            .post('/voting-sessions')
            .send(data)
            .set('Content-Type', 'application/json');

        expect(session.status).to.equal(201);
    });

    it('Deve criar um membro', async function () {
        // Crie um novo membro

        const data = {
            cpf: memberId,
        };

        member = await request
            .post('/members')
            .send(data)
            .set('Content-Type', 'application/json');

        expect(member.status).to.equal(201);
    });

    it('Deve votar na sessão de votação', async function () {
        // Vote na sessão de votação

        const sessionId = session.body.id;
        const url = `/voting-sessions/${sessionId}/vote`;

        const data = {
            cpf: memberId,
            voto: "Sim"
        };

        const vote = await request
            .post(url)
            .send(data)
            .set('Content-Type', 'application/json');

        expect(vote.status).to.equal(200);
    });
});