const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Ejemplo de endpoint de API
app.get('/api/ejemplo', (req, res) => {
  res.json({ mensaje: '¡Hola desde la API de ByteBazz!' });
});

// Servir el frontend para cualquier otra ruta
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
}); 