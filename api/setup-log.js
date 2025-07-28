#!/usr/bin/env node

// 📝 Script para configurar el sistema de logs
const fs = require('fs');
const path = require('path');

console.log('📝 Configurando sistema de logs para JuegoTEA...');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ Directorio logs/ creado');
} else {
  console.log('ℹ️  Directorio logs/ ya existe');
}

// Crear archivos de log vacíos si no existen
const logFiles = ['combined.log', 'error.log'];

logFiles.forEach(filename => {
  const filePath = path.join(logsDir, filename);
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`✅ Archivo ${filename} creado`);
  } else {
    console.log(`ℹ️  Archivo ${filename} ya existe`);
  }
});

// Crear .gitkeep para mantener la carpeta en git
const gitkeepPath = path.join(logsDir, '.gitkeep');
if (!fs.existsSync(gitkeepPath)) {
  fs.writeFileSync(gitkeepPath, '');
  console.log('✅ Archivo .gitkeep creado');
}

// Actualizar .gitignore para excluir logs pero mantener la carpeta
const gitignorePath = path.join(__dirname, '.gitignore');
const gitignoreContent = `
# Logs
logs/*.log
!logs/.gitkeep
`;

if (fs.existsSync(gitignorePath)) {
  const currentContent = fs.readFileSync(gitignorePath, 'utf8');
  if (!currentContent.includes('logs/*.log')) {
    fs.appendFileSync(gitignorePath, gitignoreContent);
    console.log('✅ .gitignore actualizado');
  }
} else {
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log('✅ .gitignore creado');
}

console.log('\n🎉 Sistema de logs configurado correctamente!');
console.log('\n📋 Comandos útiles:');
console.log('  npm run logs        - Ver logs en tiempo real');
console.log('  npm run logs:error  - Ver solo errores');
console.log('  npm run clean:logs  - Limpiar archivos de log');
console.log('  npm run dev:verbose - Ejecutar con logs detallados');
console.log('\n📁 Ubicación de logs: ./logs/');
console.log('  📄 combined.log - Todos los logs');
console.log('  📄 error.log    - Solo errores');