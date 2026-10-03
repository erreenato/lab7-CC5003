## 📝 Checklist — P1: Modelado de Datos (Users & Posts)

- **Modelo de Usuario (`backend/src/models/user.ts`)**
  -  Definir los campos requeridos: `username`, `email` y `passwordHash`.
  -  Aplicar `unique: true` tanto para `username` como para `email`.
  -  Agregar validación por Expresión Regular para el campo `email`: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
  -  Configurar la opción `toJSON` para remover `_id`, `__v` y `passwordHash` en las respuestas de la API.

-  **Modelo de Publicaciones (`backend/src/models/posts.ts`)**
    - Agregar la propiedad opcional `user?: mongoose.Types.ObjectId` a la interfaz `Post`.
    -  Agregar el campo `user` al esquema `postSchema` referenciando al modelo `'User'` (`ref: "User"`) sin la restricción `required` para permitir publicaciones anónimas.


## 📝 Checklist — P2: Endpoints de Usuarios (`backend/src/controllers/users.ts/ - api/users`)

-  **Ruta `GET /api/users`**
    -  Retornar la lista completa de usuarios registrados.
-  **Ruta `POST /api/users`**
    -  Validar que la contraseña tenga mínimo 3 caracteres (error `400`).
    -  Validar el formato de correo con Regex (error `400`).
    -  Validar unicidad de `username` informando si ya existe (error `400`).
    -  Validar unicidad de `email` informando si ya existe (error `400`).
    -  Generar el hash de la contraseña usando `bcrypt` antes de guardar.

## 📝 Checklist — P3: Autenticación e Inicio de Sesión (`backend/src/controllers/login.ts/ - POST /api/login`)

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