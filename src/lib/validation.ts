const usernameRegex = /^[a-zA-Z][a-zA-Z0-9._-]*$/;
const passwordRegex = /^[A-Za-z\d\s@$!%*?&]{6,32}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegistration({
  username,
  email,
  password,
  confirmPassword,
}: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  if (!username || !email || !password || !confirmPassword) {
    return "Preencha todos os campos.";
  }

  if (username.length < 3 || username.length > 20) {
    return "Nome de usuário deve ter entre 3 e 20 caracteres.";
  }

  if (!usernameRegex.test(username)) {
    return "Nome de usuário inválido. Deve começar com letras e conter apenas letras, números, pontos, hífens ou underlines.";
  }

  if (!emailRegex.test(email)) {
    return "Email inválido.";
  }

  if (password.length < 6 || password.length > 32) {
    return "Senha deve ter pelo menos 6 caracteres.";
  }

  if (!passwordRegex.test(password)) {
    return "Sua senha contém caracteres não permitidos.";
  }

  if (password !== confirmPassword) {
    return "As senhas não coincidem.";
  }

  return null;
}
