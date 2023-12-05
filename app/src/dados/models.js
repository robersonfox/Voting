const uuid = require('uuid');

// Modelo para associados (membros)
const createMember = (cpf) => ({
  cpf,
});

// Modelo para sessões de votação
const createVotingSession = (nome, descricao) => ({
  id: uuid.v4(),
  data: { type: String, default: Date.now() },
  nome,
  descricao,
  voto: [],
});

module.exports = { createMember, createVotingSession };
