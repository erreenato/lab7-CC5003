## 📝 Checklist — P1: Modelado de Datos (Users & Posts)

- **Modelo de Usuario (`backend/src/models/user.ts`)**
  -  Definir los campos requeridos: `username`, `email` y `passwordHash`.
  -  Aplicar `unique: true` tanto para `username` como para `email`.
  -  Agregar validación por Expresión Regular para el campo `email`: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
  -  Configurar la opción `toJSON` para remover `_id`, `__v` y `passwordHash` en las respuestas de la API.

-  **Modelo de Publicaciones (`backend/src/models/posts.ts`)**
    - Agregar la propiedad opcional `user?: mongoose.Types.ObjectId` a la interfaz `Post`.
    -  Agregar el campo `user` al esquema `postSchema` referenciando al modelo `'User'` (`ref: "User"`) sin la restricción `required` para permitir publicaciones anónimas.


## 📝 Checklist — P2: Endpoints de Usuarios (`backend/src/controllers/users.ts/` - `api/users`)

-  **Ruta `GET /api/users`**
    -  Retornar la lista completa de usuarios registrados.
-  **Ruta `POST /api/users`**
    -  Validar que la contraseña tenga mínimo 3 caracteres (error `400`).
    -  Validar el formato de correo con Regex (error `400`).
    -  Validar unicidad de `username` informando si ya existe (error `400`).
    -  Validar unicidad de `email` informando si ya existe (error `400`).
    -  Generar el hash de la contraseña usando `bcrypt` antes de guardar.

## 📝 Checklist — P3: Autenticación e Inicio de Sesión (`backend/src/controllers/login.ts/` - `POST /api/login`)

- **Validación de Credenciales**
  -  Buscar al usuario por `username` y verificar hash con `bcrypt.compare`.
  -  Retornar `401 Unauthorized` con mensaje genérico si falla usuario o clave.
-  **Generación de Tokens**
    -  Generar token CSRF utilizando `crypto.randomUUID()`.
    -  Generar JWT con `id`, `username` y `csrf` expirable en 1 hora (`1h`).
-  **Envío de Respuesta**
    -  Adjuntar el JWT en la cookie `httpOnly` llamada `token`.
    -  Adjuntar el token CSRF en el header `X-CSRF-Token`.
    -  Retornar el `username` en el cuerpo del JSON con estado `200 OK`.

## 📝 Checklist — P4: Middleware `withUser`, Session `/me` & Logout

-  **Middleware `withUser` (`backend/src/utils/middleware.ts`)**
    -  Verificar presencia de la cookie `token` y la cabecera `X-CSRF-Token`.
    -  Validar JWT firmado y comparar que `decodedToken.csrf === header['x-csrf-token']`.
    -  Inyectar `id` del usuario en `request.userId` y llamar a `next()`.
    -  Responder `401 Unauthorized` si falta token, CSRF no coincide o el JWT es inválido.
-  **Ruta `backend/src/controllers/login.ts/` - `GET /api/login/me`**
     -  Proteger con el middleware `withUser` y responder con la información del usuario autenticado.
-  **Ruta `backend/src/controllers/login.ts/` - `POST /api/login/logout`**
    -  Borrar la cookie `token` usando `response.clearCookie('token')`.
-  **Manejador de Errores (`backend/src/utils/middleware.ts - errorHandler`)**
    -  Capturar `TokenExpiredError` y responder con estado HTTP `401`.

## 📝 Checklist — P5: Autenticación Opcional (`withOptionalUser`)

-  **Middleware `withOptionalUser` (`backend/src/utils/middleware.ts`)**
    -  Dejar continuar la petición (`next()`) si no existe la cookie `token`.
    -  Validar token JWT y cabecera `X-CSRF-Token` si la cookie está presente.
     -  Responder `401 Unauthorized` si la cookie trae un token inválido o expirado.
-  **Creación de Threads y Comentarios (`backend/src/controllers/login.ts/` - `POST /api/threads` y `POST /api/threads/:id`)**
    -  Proteger ambas rutas con el middleware `withOptionalUser`.
    -  **Con Sesión:** Usar el `username` del usuario logueado como `author`, guardar el `_id` en el campo `user` e ignorar el `author` del cuerpo.
    -  **Sin Sesión:** Usar el `author` proveniente del cuerpo o asignar `"Anónimo"` si no se envía.

## 📝 Checklist — P6: Conexión Frontend & Autenticación

-  **Instancia de Axios Segura (`frontend/src/utils/axiosSecure.ts`)**
    -  Crear interceptor para incluir la cabecera `X-CSRF-Token` leyendo desde `localStorage`.
    -  Usar `axiosSecure` para el envío de threads y comentarios.
-  **Servicio de Login (`frontend/src/services/login.ts`)**
    -  `login()`: Guardar el token CSRF recibido en el header hacia `localStorage`.
    -  `restoreLogin()`: Consultar `GET /api/login/me` usando `axiosSecure`.
    -  `logout()`: Ejecutar `POST /api/login/logout` y limpiar el `localStorage`.
-  **Componentes e Integración**
    -  Implementar el formulario en `pages/Login.tsx`.
    -  Implementar botón de logout en `components/TopBar.tsx`.
    -  Ejecutar `restoreLogin()` en un `useEffect` al montar `App.tsx` para mantener la sesión activa.