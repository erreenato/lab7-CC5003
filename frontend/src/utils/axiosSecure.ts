import axios from "axios";

const axiosSecure = axios.create();

// Interceptor para inyectar la cabecera X-CSRF-Token antes de enviar cualquier petición
axiosSecure.interceptors.request.use(
  (config) => {
    const csrfToken = localStorage.getItem("csrfToken");
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosSecure;