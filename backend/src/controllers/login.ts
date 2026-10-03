import { Router } from "express";
import { withUser } from "../utils/middleware";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user";

const loginRouter = Router();

loginRouter.post("/", async (request, response) => {
  const { username, password } = request.body;

  // 1. Buscar usuario en la BD
  const user = await User.findOne({ username });

  // 2. Validar usuario y contraseña usando bcrypt
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    response.status(401).json({
      error: "invalid username or password",
    });
    return;
  }

  // 3. Generar token CSRF (UUID)
  const csrfToken = crypto.randomUUID();

  // 4. Crear payload y firmar el JWT (expira en 1 hora)
  const userForToken = {
    username: user.username,
    id: user._id,
    csrf: csrfToken,
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  const token = jwt.sign(userForToken, secret, { expiresIn: "1h" });

  // 5. Configurar la cookie HttpOnly para el JWT
  response.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  // 6. Enviar token CSRF en la cabecera y username en el cuerpo
  response.setHeader("X-CSRF-Token", csrfToken);
  response.status(200).json({ username: user.username });
});

// GET /api/login/me - Obtiene la sesión actual
loginRouter.get("/me", withUser, async (request, response) => {
  const user = await User.findById(request.userId);
  if (!user) {
    response.status(404).json({ error: "user not found" });
    return;
  }
  response.json(user);
});

// POST /api/login/logout - Cierra la sesión eliminando la cookie
loginRouter.post("/logout", (_request, response) => {
  response.clearCookie("token");
  response.status(200).json({ message: "logged out successfully" });
});

export default loginRouter;
