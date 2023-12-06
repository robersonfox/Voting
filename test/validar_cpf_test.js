var expect    = require("chai").expect;
var validarCPF = require("../app/src/util/validar_cpf");

describe("Validar CPF", function() {
  it("CPF válido", function() {
    expect(validarCPF("12345678909")).equal(true);
  });

  it("CPF inválido", function() {
    expect(validarCPF("12345678901")).equal(false);
  });
});