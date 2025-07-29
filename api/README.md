# 🧩 JuegoTEA API

API backend para la plataforma educativa JuegoTEA, especializada en juegos interactivos para niños con Trastorno del Espectro Autista (TEA).

## 🚀 Deploy en Render

- **API URL**: https://api-juegostea.onrender.com
- **Frontend URL**: https://juegostea.onrender.com
- **Estado**: [![Deploy Status](https://api.render.com/v1/services/srv-YOUR_SERVICE_ID/deploys/latest/badge)](https://render.com)

## 📋 Endpoints Disponibles

### Salud y Estado
- `GET /` - Información general de la API
- `GET /health` - Estado de salud del servidor

### Suscripciones
- `POST /api/subscription/create` - Crear nueva suscripción premium
- `GET /api/subscription/status` - Verificar estado de suscripción
- `POST /api/subscription/webhook` - Webhook de MercadoPago

## 🛠️ Instalación y Desarrollo

### Prerrequisitos
```bash
Node.js >= 16.0.0
npm >= 8.0.0
```

### Instalación Local
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/juegotea.git
cd juegotea/api

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar en modo producción
npm start
```

### Variables de Entorno Requeridas

```env
# Puerto del servidor
PORT=3000

# Entorno (development/production)
NODE_ENV=development

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_token_here

# URLs de frontend (para CORS)
FRONTEND_URL=https://juegostea.onrender.com
```