import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../models/user";

const usersRouter = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/users - Lista todos los usuarios
usersRouter.get("/", async (_request, response) => {
  const users = await User.find({});
  response.json(users);
});

// POST /api/users - Crea un nuevo usuario
usersRouter.post("/", async (request, response) => {
  const { username, email, password } = request.body;

  // 1. Validar longitud de la contraseña
  if (!password || password.length < 3) {
    response.status(400).json({
      error: "password must be at least 3 characters long",
    });
    return;
  }

  // 2. Validar formato del correo
  if (!email || !EMAIL_REGEX.test(email)) {
    response.status(400).json({
      error: "invalid email format",
    });
    return;
  }

  // 3. Verificar si el username ya existe
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    response.status(400).json({
      error: "username already exists",
    });
    return;
  }

  // 4. Verificar si el email ya existe
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    response.status(400).json({
      error: "email already exists",
    });
    return;
  }

  // 5. Hashear contraseña y guardar usuario
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    email,
    passwordHash,
  });

  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

export default usersRouter;
