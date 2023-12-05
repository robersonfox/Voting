function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
  
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }
  
    const calcularDigito = (slice) => {
      let soma = 0;
      for (let i = 0; i < slice.length; i++) {
        soma += parseInt(slice.charAt(i)) * (slice.length + 1 - i);
      }
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };
  
    const digito1 = calcularDigito(cpf.slice(0, 9));
    const digito2 = calcularDigito(cpf.slice(0, 10));
  
    return parseInt(cpf.charAt(9)) === digito1 && parseInt(cpf.charAt(10)) === digito2;
  }
  
  module.exports = validarCPF;