## 📝 Checklist — P1: Modelado de Datos (Users & Posts)

- **Modelo de Usuario (`backend/src/models/user.ts`)**
  -  Definir los campos requeridos: `username`, `email` y `passwordHash`.
  -  Aplicar `unique: true` tanto para `username` como para `email`.
  -  Agregar validación por Expresión Regular para el campo `email`: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
  -  Configurar la opción `toJSON` para remover `_id`, `__v` y `passwordHash` en las respuestas de la API.

-  **Modelo de Publicaciones (`backend/src/models/posts.ts`)**
    - Agregar la propiedad opcional `user?: mongoose.Types.ObjectId` a la interfaz `Post`.
    -  Agregar el campo `user` al esquema `postSchema` referenciando al modelo `'User'` (`ref: "User"`) sin la restricción `required` para permitir publicaciones anónimas.