const express = require('express');
const bodyParser = require('body-parser');

const { createMember, createVotingSession } = require('./dados/models');
const { dynamoDB } = require('./dados/db');

const validarCPF = require('./util/validar_cpf');

const app = express();

const pautaTable = 'schedule';
const membersTable = 'members';

const port = 3000;

app.use(bodyParser.json());

// Rota para criar um novo membros
app.post('/members', async (req, res) => {
  try {
    const { cpf } = req.body;

    if (validarCPF(cpf)) {
      const member = createMember(cpf);

      const params = {
        TableName: membersTable,
        Item: {
          PK: `MEMBER#${member.cpf}`,
          ...member,
        },
      };

      await dynamoDB.put(params).promise();
      res.status(201).send(member);
    } else {
      return res.status(400).send('UNABLE_TO_VOTE');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Rota para iniciar uma nova sessão de votação
app.post('/voting-sessions', async (req, res) => {

  try {
    const { nome, descricao } = req.body;
    const votingSession = createVotingSession(nome, descricao);

    const params = {
      TableName: pautaTable,
      Item: {
        PK: `SESSION#${votingSession.id}`,
        ...votingSession,
      },
    };

    await dynamoDB.put(params).promise();
    res.status(201).send(votingSession);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Rota para votar em uma sessão de votação
app.post('/voting-sessions/:id/vote', async (req, res) => {
  try {
    const id = req.params.id;
    const { cpf, voto } = req.body;

    const votingSessionParams = {
      TableName: pautaTable,
      Key: { id },
    };

    const votingSessionResult = await dynamoDB.get(votingSessionParams).promise();
    const votingSession = votingSessionResult.Item;

    if (!votingSession) {
      return res.status(404).send('Sessão de votação não encontrada');
    }

    // Impedir votação após 2 horas
    const creationDate = parseFloat(votingSession.data.default);

    const expiryHour = new Date(creationDate)
      .getHours();
    const expiryDate = new Date(creationDate)
      .setHours(expiryHour + 2);

    if (expiryDate < Date.now()) {
      return res.status(400).send('Sessão de votação encerrada');
    }

    const memberParams = {
      TableName: membersTable,
      Key: { cpf },
    };

    const memberResult = await dynamoDB.get(memberParams).promise();
    const member = memberResult.Item;

    if (!member) {
      return res.status(404).send('Associado não encontrado');
    }

    if (votingSession.voto.find(v => v.member === member.cpf)) {
      return res.status(400).send('Associado já votou');
    }

    votingSession.voto.push({ member: member.cpf, voto });

    const updateParams = {
      TableName: pautaTable,
      Key: { id },
      UpdateExpression: 'SET voto = :voto',
      ExpressionAttributeValues: { ':voto': votingSession.voto },
    };

    await dynamoDB.update(updateParams).promise();

    res.status(200).send(votingSession);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.get('/voting-results', async (req, res) => {
  try {
    const scanParams = {
      TableName: pautaTable,
      FilterExpression: 'attribute_exists(voto)',
    };

    const scanResult = await dynamoDB.scan(scanParams).promise();
    const votingResults = [];

    for (const item of scanResult.Items) {
      const { nome: pauta, descricao, voto: votos } = item;

      const result = {
        pauta,
        descricao,
        votos: { "contra": 0, "favor": 0 },
      };

      votos.forEach((voto) => {
        if (voto.voto == 'S') {
          result.votos.favor++;
        } else {
          result.votos.contra++;
        }
      });

      votingResults.push(result);
    }

    res.status(200).json(votingResults);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;