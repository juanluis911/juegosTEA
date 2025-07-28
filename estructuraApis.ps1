# PowerShell Script simple para crear estructura del backend JuegoTEA
Write-Host "🧩 Creando estructura backend en carpeta 'api'..." -ForegroundColor Cyan

# Verificar si existe carpeta api
if (Test-Path "api") {
    $response = Read-Host "La carpeta 'api' ya existe. ¿Sobrescribir? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Operación cancelada." -ForegroundColor Red
        exit
    }
    Remove-Item -Recurse -Force "api"
}

# Crear carpeta api y entrar
New-Item -ItemType Directory -Path "api" | Out-Null
Set-Location "api"

Write-Host "Creando directorios..." -ForegroundColor Yellow

# Crear directorios
$directories = @(
    "src",
    "src/controllers", 
    "src/middleware",
    "src/routes",
    "src/services",
    "src/models",
    "src/utils",
    "src/config",
    "tests",
    "docs",
    "logs"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    Write-Host "  ✅ $dir" -ForegroundColor Green
}

Write-Host "Creando archivos..." -ForegroundColor Yellow

# Archivos raíz
$rootFiles = @(
    "package.json",
    "server.js", 
    ".env.example",
    ".gitignore",
    "README.md",
    "render.yaml"
)

foreach ($file in $rootFiles) {
    New-Item -ItemType File -Path $file | Out-Null
    Write-Host "  ✅ $file" -ForegroundColor Green
}

# Archivos src/config
$configFiles = @(
    "src/config/firebase.js",
    "src/config/database.js", 
    "src/config/mercadopago.js"
)

foreach ($file in $configFiles) {
    New-Item -ItemType File -Path $file | Out-Null
    Write-Host "  ✅ $file" -ForegroundColor Green
}

# Archivos src/controllers
$controllerFiles = @(
    "src/controllers/authController.js",
    "src/controllers/subscriptionController.js",
    "src/controllers/userController.js",
    "src/controllers/gameController.js"
)

foreach ($file in $controllerFiles) {
    New-Item -ItemType File -Path $file | Out-Null
    Write-Host "  ✅ $file" -ForegroundColor Green
}

# Archivos src/middleware
$middlewareFiles = @(
    "src/middleware/auth.js",
    "src/middleware/subscription.js",
    "src/middleware/cors.js",
    "src/middleware/validation.js",
    "src/middleware/errorHandler.js"
)

foreach ($file in $middlewareFiles) {
    New-Item -ItemType File -Path $file | Out-Null
    Write-Host "  ✅ $file" -ForegroundColor Green
}

# Archivos src/routes
$routeFiles = @(
    "src/routes/auth.js",
    "src/routes/subscription.js", 
    "src/routes/user.js",
    "src/routes/games.js",
    "src/routes/index.js"
)

foreach ($file in $routeFiles) {
    New-Item -ItemType File -Path $file | Out-Null
    Write-Host "  ✅ $file" -ForegroundColor Green
}

# Archivos src/services
$serviceFiles = @(
    "src/services/firebaseService.js",
    "src/services/mercadopagoService.js",
    "src/services/emailService.js",
    "src/services/notificationService.js"
)

foreach ($file in $serviceFiles) {
    New-Item -ItemType File -Path $file | Out-Null
    Write-Host "  ✅ $file" -ForegroundColor Green
}

# Archivos src/models
$modelFiles = @(
    "src/models/User.js",
    "src/models/Subscription.js",
    "src/models/GameProgress.js"
)

foreach ($file in $modelFiles) {
    New-Item -ItemType File -Path $file | Out-Null
    Write-Host "  ✅ $file" -ForegroundColor Green
}

# Archivos src/utils
$utilFiles = @(
    "src/utils/logger.js",
    "src/utils/validation.js",
    "src/utils/constants.js",
    "src/utils/helpers.js",
    "src/utils/dateUtils.js"
)

foreach ($file in $utilFiles) {
    New-Item -ItemType File -Path $file | Out-Null
    Write-Host "  ✅ $file" -ForegroundColor Green
}

# Archivos tests
$testFiles = @(
    "tests/auth.test.js",
    "tests/subscription.test.js",
    "tests/games.test.js",
    "tests/setup.js"
)

foreach ($file in $testFiles) {
    New-Item -ItemType File -Path $file | Out-Null
    Write-Host "  ✅ $file" -ForegroundColor Green
}

# Archivos docs
$docFiles = @(
    "docs/API.md",
    "docs/DEPLOYMENT.md",
    "docs/DEVELOPMENT.md",
    "docs/ENVIRONMENT.md"
)

foreach ($file in $docFiles) {
    New-Item -ItemType File -Path $file | Out-Null
    Write-Host "  ✅ $file" -ForegroundColor Green
}

# Crear .gitkeep en logs
New-Item -ItemType File -Path "logs/.gitkeep" | Out-Null
Write-Host "  ✅ logs/.gitkeep" -ForegroundColor Green

# Crear .gitignore básico
@"
node_modules/
.env
*.log
logs/
coverage/
dist/
build/
.DS_Store
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8

# Volver al directorio padre
Set-Location ..

# Mostrar estadísticas
$totalDirs = (Get-ChildItem -Path "api" -Recurse -Directory).Count
$totalFiles = (Get-ChildItem -Path "api" -Recurse -File).Count

Write-Host "`n📊 Estructura creada:" -ForegroundColor Cyan
Write-Host "  📁 Directorios: $totalDirs" -ForegroundColor Yellow
Write-Host "  📄 Archivos: $totalFiles" -ForegroundColor Yellow

Write-Host "`n✅ Estructura del backend creada en 'api/'" -ForegroundColor Green
Write-Host "Próximos pasos:" -ForegroundColor Magenta
Write-Host "  1. cd api" -ForegroundColor White
Write-Host "  2. npm install express cors helmet dotenv firebase-admin mercadopago" -ForegroundColor White
Write-Host "  3. Configurar .env" -ForegroundColor White
Write-Host "  4. Implementar código" -ForegroundColor White