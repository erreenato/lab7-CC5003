import axios from "axios";
import axiosSecure from "../utils/axiosSecure";
import type { User } from "../types/users";
const baseUrl = "/api/login";

// 1. Iniciar sesión
const login = async (credentials: { username: string; password: string }) => {
  const response = await axios.post(baseUrl, credentials);
  
  // Guardar el token CSRF recibido en las cabeceras de respuesta
  const csrfToken = response.headers["x-csrf-token"];
  if (csrfToken) {
    localStorage.setItem("csrfToken", csrfToken);
  }

  return response.data; // { username: string }
};

// 2. Restaurar sesión al recargar la página
const restoreLogin = async (): Promise<User | null> => {
  try {
    const response = await axiosSecure.get<User>(`${baseUrl}/me`);
    return response.data;
  } catch (error) {
    // Si la cookie expiró o es inválida, se limpia el localStorage
    localStorage.removeItem("csrfToken");
    return null;
  }
};

// 3. Cerrar sesión
const logout = async () => {
  try {
    await axiosSecure.post(`${baseUrl}/logout`);
  } finally {
    // Siempre remover el token del cliente
    localStorage.removeItem("csrfToken");
  }
};

export default { login, restoreLogin, logout };