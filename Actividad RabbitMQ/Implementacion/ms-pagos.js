const crypto = require('crypto');
const express = require('express');

const NOMBRE = 'ms-pagos';
const app = express();
const port = 3001;

app.use(express.json());

// Endpoint síncrono: autoriza o rechaza el cobro de un pedido.
app.post('/api/pagos', (req, res) => {
    const { usuarioId, productoId, cantidad } = req.body;
    console.log(`[${NOMBRE}] Procesando pago - Usuario: ${usuarioId}, Producto: ${productoId}, Cantidad: ${cantidad}`);

    // Simulación: el producto "999" tiene el pago rechazado (ej: sin fondos / sin stock).
    if (productoId === '999') {
        console.log(`[${NOMBRE}] Pago rechazado para el producto: ${productoId}`);
        return res.status(402).json({ aprobado: false, error: 'Pago rechazado: transacción no autorizada.' });
    }

    const transaccionId = `TX-${crypto.randomUUID()}`;
    console.log(`[${NOMBRE}] Pago aprobado: ${transaccionId}`);
    res.json({ aprobado: true, transaccionId, mensaje: 'Pago aprobado correctamente.' });
});

app.listen(port, () => {
    console.log(`[${NOMBRE}] Escuchando en http://localhost:${port}`);
});
