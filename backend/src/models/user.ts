import { Schema, model } from "mongoose";

// Interfaz para TypeScript (opcional pero recomendada para autocompletado)
export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Por favor ingresa un correo electrónico válido"],
  },
  passwordHash: {
    type: String,
    required: true,
  },
});

// Configuración de toJSON para limpiar la salida hacia la API
userSchema.set("toJSON", {
  transform: (_document, returnedObject: Record<string, any>) => {
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

const User = model<IUser>("User", userSchema);

export default User;