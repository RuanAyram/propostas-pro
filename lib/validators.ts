/**
 * Valida um CPF brasileiro
 * @param cpf - CPF com ou sem formatação
 * @returns true se o CPF é válido, false caso contrário
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) {
    return false;
  }

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) {
    return false;
  }

  return true;
}

/**
 * Formata um CPF para o padrão XXX.XXX.XXX-XX
 * @param cpf - CPF sem formatação
 * @returns CPF formatado
 */
export function formatCPF(cpf: string): string {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Remove a formatação do CPF
 * @param cpf - CPF formatado
 * @returns CPF apenas com números
 */
export function unformatCPF(cpf: string): string {
  return cpf.replace(/[^\d]/g, '');
}

/**
 * Valida um telefone brasileiro
 * @param phone - Telefone com ou sem formatação
 * @returns true se o telefone é válido, false caso contrário
 */
export function validatePhone(phone: string): boolean {
  // Remove caracteres não numéricos
  phone = phone.replace(/[^\d]/g, '');

  // Verifica se tem 10 ou 11 dígitos (com ou sem 9 na frente)
  if (phone.length < 10 || phone.length > 11) {
    return false;
  }

  // Verifica se o DDD é válido (11 a 99)
  const ddd = parseInt(phone.substring(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }

  return true;
}

/**
 * Formata um telefone para o padrão (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 * @param phone - Telefone sem formatação
 * @returns Telefone formatado
 */
export function formatPhone(phone: string): string {
  phone = phone.replace(/[^\d]/g, '');
  
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Remove a formatação do telefone
 * @param phone - Telefone formatado
 * @returns Telefone apenas com números
 */
export function unformatPhone(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}