# 🚀 Configuración para Render - JuegoTEA

## Variables de Entorno en Render

Ve a tu dashboard de Render → Tu servicio → Environment y configura:

```
NODE_ENV=production
MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu-token-de-produccion-aqui
FRONTEND_URL=https://juegostea.onrender.com
API_URL=https://api-juegostea.onrender.com
PORT=3000
```

## ⚠️ Pasos Críticos:

### 1. Obtener Token de Producción
- Ve a [MercadoPago Developers](https://www.mercadopago.com/developers/panel)
- Navega a: **Integraciones → Credenciales**
- En la sección **"Producción"** (NO "Pruebas")
- Copia tu **Access Token** (empieza con `APP_USR-`)

### 2. Configurar en Render
- Dashboard → Tu servicio API → **Environment**
- Haz clic en **"Add Environment Variable"**
- Añade cada variable una por una
- **NO pongas comillas** alrededor de los valores

### 3. Verificar Configuración
- Después de guardar las variables
- Ve a **"Deploy"** → **"Redeploy"**
- Espera a que el deploy termine
- Revisa los logs para confirmar: "MercadoPago configurado en modo production"

### 4. Probar Pago Real
- Usa una tarjeta real (NO tarjetas de prueba)
- El error "Una de las partes es de prueba" debe desaparecer
- El pago debe procesarse correctamente

## 🔍 Solución de Problemas

Si sigues viendo el error:
1. Verifica que tu token empiece con `APP_USR-`
2. Confirma que `NODE_ENV=production`
3. Reinicia completamente el servicio
4. Revisa los logs del servidor

## 📞 Contacto
Si necesitas ayuda: [soporte@juegotea.com](mailto:soporte@juegotea.com)
