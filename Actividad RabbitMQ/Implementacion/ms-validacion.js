const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

// Endpoint para validar si un producto tiene stock
app.get('/api/validacion/stock/:productoId', (req, res) => {
    const { productoId } = req.params;
    console.log(`[ms-validacion] Validando stock para el producto: ${productoId}`);
    
    // Simulación: Si el productoId es "999", no hay stock.
    if (productoId === '999') {
        console.log(`[ms-validacion] Sin stock para el producto: ${productoId}`);
        return res.status(400).json({ error: 'No hay stock suficiente para este producto.' });
    }
    
    console.log(`[ms-validacion] Stock confirmado para el producto: ${productoId}`);
    res.json({ productoId, valid: true, mensaje: 'Stock validado correctamente.' });
});

app.listen(port, () => {
    console.log(`[ms-validacion] Escuchando en http://localhost:${port}`);
});
