# 🚀 Guía Completa para Subir Spot a las App Stores

## 📋 Requisitos Previos

### 1. Instalar Node.js
```bash
# Descargar desde: https://nodejs.org/
# O usar Homebrew:
brew install node
```

### 2. Verificar instalación
```bash
node --version
npm --version
```

## 🛠️ Configuración del Proyecto

### 1. Instalar Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

### 2. Inicializar Capacitor
```bash
npx cap init "Spot" "com.spot.events" --web-dir="."
```

### 3. Agregar plataformas
```bash
npx cap add ios
npx cap add android
```

## 📱 Generar Iconos

### 1. Crear iconos desde el generador
- Abrir `create-icons.html` en el navegador
- Generar iconos de 192x192 y 512x512
- Guardar como `icon-192.png` y `icon-512.png`

### 2. Generar iconos para todas las plataformas
- Abrir `generate-all-icons.html`
- Generar todos los tamaños necesarios
- Guardar en la carpeta del proyecto

## 🍎 Para iOS (App Store)

### 1. Sincronizar con iOS
```bash
npx cap sync ios
```

### 2. Abrir en Xcode
```bash
npx cap open ios
```

### 3. Configurar en Xcode
- Seleccionar el proyecto "Spot"
- En "Signing & Capabilities":
  - Team: Tu Apple Developer Team
  - Bundle Identifier: com.spot.events
- En "General":
  - Display Name: Spot
  - Version: 1.0.0
  - Build: 1

### 4. Configurar iconos
- Arrastrar iconos a AppIcon en Xcode
- Tamaños necesarios: 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

### 5. Crear build
- Product → Archive
- Distribuir App → App Store Connect

## 🤖 Para Android (Google Play)

### 1. Sincronizar con Android
```bash
npx cap sync android
```

### 2. Abrir en Android Studio
```bash
npx cap open android
```

### 3. Configurar en Android Studio
- En `android/app/build.gradle`:
  - applicationId: "com.spot.events"
  - versionCode: 1
  - versionName: "1.0.0"

### 4. Configurar iconos
- Copiar iconos a `android/app/src/main/res/`
- Tamaños: mipmap-hdpi, mipmap-mdpi, mipmap-xhdpi, mipmap-xxhdpi, mipmap-xxxhdpi

### 5. Generar APK
- Build → Generate Signed Bundle/APK
- Seleccionar APK
- Crear keystore si es necesario

## 💰 Costos

### Apple App Store
- **Apple Developer Program**: $99/año
- **Cuota única** por app

### Google Play Store
- **Google Play Console**: $25 (una sola vez)
- **Sin cuota anual**

## 📝 Información de la App

### Datos Básicos
- **Nombre**: Spot
- **Descripción**: Spot los mejores eventos en El Salvador
- **Categoría**: Entretenimiento
- **Precio**: Gratis
- **Idioma**: Español

### Capturas de Pantalla
- iPhone: 6.7", 6.5", 5.5"
- Android: Varios tamaños de pantalla

### Descripción para las Stores
```
Spot es la app definitiva para descubrir eventos en El Salvador. 
Conecta con los mejores eventos de música, deportes, cultura y tecnología.

Características:
• Descubre eventos cerca de ti
• Múltiples precios (VIP, General, Niños)
• Métodos de pago seguros
• Crea eventos como empresario
• Compra entradas fácilmente

¡No te pierdas ningún evento importante en El Salvador!
```

## 🚀 Pasos Finales

### 1. Probar la app
- Probar en dispositivos reales
- Verificar todas las funcionalidades
- Probar compras y pagos

### 2. Subir a las stores
- **iOS**: App Store Connect
- **Android**: Google Play Console

### 3. Proceso de revisión
- **iOS**: 1-7 días
- **Android**: 1-3 días

## 📞 Soporte

Si necesitas ayuda con algún paso específico, puedo ayudarte a:
- Configurar Capacitor
- Generar los iconos
- Resolver errores de build
- Optimizar para las stores

¡Tu app Spot está lista para conquistar las app stores! 🎉
