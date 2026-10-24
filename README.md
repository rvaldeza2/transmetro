# Transmetro

Sistema de Control para el Transmetro: API REST (Express + MySQL) en `backend/` y frontend Angular en `frontend/`.

En Render se despliega como un solo servicio definido en `render.yaml`.

Aplicación publicada: https://transmetro-ixg8.onrender.com

## Base de datos

- Instalación nueva: ejecutar `backend/config/db.sql` (crea la base `transmetro` con datos de prueba).
- Base existente creada con la versión anterior: ejecutar una sola vez `backend/config/migracion_v2.sql`
  sobre la base `transmetro`. Agrega la pregunta de seguridad de los usuarios y las tablas `visita` y `alerta`
  sin borrar datos.

Usuarios de prueba: `admin`, `operador` y `consulta`, con contraseña `Transmetro2026!`.
Respuesta a la pregunta de seguridad: `azul`.
