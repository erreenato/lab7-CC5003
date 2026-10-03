import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import logger from "./logger";

// Extensión del tipo de Payload para JWT
interface CustomJwtPayload extends JwtPayload {
  id: string;
  username: string;
  csrf: string;
}

const requestLogger = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  logger.info("Body:  ", request.body);
  logger.info("---");
  next();
};

const unknownEndpoint = (request: Request, response: Response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (
  error: { name: string; message: string; code?: number },
  request: Request,
  response: Response,
  next: NextFunction
) => {
  logger.error(error.message);

  if (error.name === "CastError") {
    response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    response.status(400).json({ error: error.message });
  } 
  // Captura para cuando MongoDB arroje error de duplicados (E11000) si no se interceptó antes
  else if (error.code === 11000) {
    response.status(400).json({ error: "username or email already exists" });
  } 
  // P4: Manejo de Token expirado
  else if (error.name === "TokenExpiredError") {
    response.status(401).json({ error: "token expired" });
  } 
  // Manejo genérico de token inválido (JsonWebTokenError)
  else if (error.name === "JsonWebTokenError") {
    response.status(401).json({ error: "invalid token" });
  } else {
    next(error);
  }
};

// P4: Middleware withUser
export const withUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token;
    const csrfHeader = req.headers["x-csrf-token"];

    // Si falta el token en la cookie o el header anti-CSRF
    if (!token || !csrfHeader) {
      res.status(401).json({ error: "token or csrf header missing" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }

    // Verificar firma del JWT
    const decodedToken = jwt.verify(token, secret) as CustomJwtPayload;

    // Comparar claim csrf del JWT con el valor enviado en la cabecera X-CSRF-Token
    if (!decodedToken.csrf || decodedToken.csrf !== csrfHeader) {
      res.status(401).json({ error: "invalid csrf token" });
      return;
    }

    // Guardar el id del usuario en req.userId
    req.userId = decodedToken.id;
    next();
  } catch (error) {
    next(error);
  }
};

// P5: Middleware con autenticación opcional
export const withOptionalUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.token;

  // Si no viene cookie de token, continuar como invitado/anónimo
  if (!token) {
    next();
    return;
  }

  // Si SI viene cookie, se valida exactamente igual que en withUser
  try {
    const csrfHeader = req.headers["x-csrf-token"];
    if (!csrfHeader) {
      res.status(401).json({ error: "csrf header missing" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }

    const decodedToken = jwt.verify(token, secret) as CustomJwtPayload;

    if (!decodedToken.csrf || decodedToken.csrf !== csrfHeader) {
      res.status(401).json({ error: "invalid csrf token" });
      return;
    }

    req.userId = decodedToken.id;
    next();
  } catch (error) {
    // Si la cookie trae un token inválido o expirado, pasa el error al errorHandler (401)
    next(error);
  }
};

export default { requestLogger, unknownEndpoint, errorHandler };