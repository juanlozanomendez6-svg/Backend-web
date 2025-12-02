import jwt from "jsonwebtoken";

const generateToken = (payload) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "8h"; // valor por defecto si no existe env

  // Validar que expiresIn sea un número o un string válido para jsonwebtoken
  let jwtOptions;
  if (!isNaN(Number(expiresIn))) {
    jwtOptions = { expiresIn: Number(expiresIn) }; // segundos
  } else {
    jwtOptions = { expiresIn }; // string tipo '8h', '1d', etc.
  }

  return jwt.sign(payload, process.env.JWT_SECRET, jwtOptions);
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Token inválido");
  }
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

export { generateToken, verifyToken, decodeToken };
