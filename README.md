# Falla Navidad · Backend

API de la votación navideña de Trifàsics, Falla Maestro Bellver – Mariano Ribera.

## Desarrollo

1. Copia `.env.example` a `.env` y completa `MONGODB_URI` y `JWT_SECRET`.
2. Ejecuta `npm install`.
3. Ejecuta `npm run dev`.

La API queda en `http://localhost:3000`. La cuenta con `ADMIN_EMAIL` se convierte automáticamente en administradora al registrarse o iniciar sesión.

## Docker Compose

Copia `.env.example` a `.env`, establece `JWT_SECRET` y `ADMIN_SETUP_KEY` con valores aleatorios privados y ejecuta `docker compose up --build -d`. Esto inicia MongoDB y la API, con volumen persistente y comprobaciones de salud. `docker compose down` detiene los servicios conservando datos. No uses `down -v` si quieres conservarlos.

También puedes iniciar solo MongoDB con `docker compose up -d mongo` y ejecutar `npm run dev` usando `MONGODB_URI=mongodb://localhost:27017/falla-navidad`.

Para crear la cuenta administradora, introduce `ADMIN_SETUP_KEY` en el campo que aparece al registrar `ADMIN_EMAIL`. Esta protección es necesaria al no verificar el correo. Registra tu cuenta antes de compartir el enlace. Los usuarios eliminados pierden acceso inmediatamente.

## Vercel

Importa este repositorio en Vercel y configura:

- `MONGODB_URI`: conexión de MongoDB Atlas.
- También admite `DATABASE_URL` como alternativa a `MONGODB_URI`.
- `JWT_SECRET`: secreto largo y aleatorio.
- `ADMIN_SETUP_KEY`: clave privada para registrar al administrador; nunca se publica en el frontend.
- `CORS_ORIGINS`: URL pública del frontend; admite varias URLs separadas por comas.
- `ADMIN_EMAIL`: `drojannp@gmail.com`.

El endpoint de comprobación es `/api/health`.
