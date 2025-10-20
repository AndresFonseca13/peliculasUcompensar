#!/bin/bash

# Script de desarrollo para CineReview con Sass
echo "🎬 Iniciando servidor de desarrollo para CineReview..."
echo "📝 Compilando Sass..."
npm run sass

echo "🚀 Iniciando servidor local en http://localhost:8000"
echo "📱 Sass en modo watch activado - los cambios se compilarán automáticamente"
echo "⏹️  Presiona Ctrl+C para detener el servidor"

# Iniciar Sass en modo watch en background
npm run sass:watch &

# Iniciar servidor HTTP
python3 -m http.server 8000

# Limpiar procesos al salir
trap "kill %1" EXIT
