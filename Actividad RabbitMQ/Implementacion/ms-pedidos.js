const crypto = require('crypto');
const express = require('express');
const axios = require('axios');
const { EVENTOS, CANALES, routingKey, publicar } = require('./rabbitmq');

const NOMBRE = 'ms-pedidos';
const app = express();
const port = 3000;
const PAGOS_URL = process.env.PAGOS_URL || 'http://localhost:3001';

app.use(express.json());

// Publica sin bloquear el flujo: un fallo de RabbitMQ se informa, pero no tumba el pedido.
async function publicarEvento(evento, canal, payload) {
    try {
        await publicar(NOMBRE, routingKey(evento, canal), payload);
        return true;
    } catch (error) {
        console.error(`[${NOMBRE}] Error publicando ${evento} en RabbitMQ:`, error.message || error.code || 'broker no disponible');
        return false;
    }
}

// Endpoint principal de creación de pedido
app.post('/api/pedidos', async (req, res) => {
    const { usuarioId, productoId, cantidad, canal = 'caja' } = req.body;

    if (!usuarioId || !productoId || !Number.isInteger(cantidad) || cantidad <= 0 || !CANALES.includes(canal)) {
        return res.status(400).json({
            error: `Datos inválidos. Se requiere usuarioId, productoId, cantidad (entero > 0) y canal opcional (${CANALES.join(' | ')}).`
        });
    }

    console.log(`[${NOMBRE}] Recibida solicitud de pedido - Usuario: ${usuarioId}, Producto: ${productoId}, Canal: ${canal}`);

    // 1. Comunicación Síncrona: autorizar el pago.
    // Debe ser síncrona: no se confirma ni se prepara el pedido si el pago no está autorizado.
    let pago;
    try {
        console.log(`[${NOMBRE}] Iniciando comunicación síncrona con ms-pagos...`);
        const respuesta = await axios.post(`${PAGOS_URL}/api/pagos`, { usuarioId, productoId, cantidad }, { timeout: 3000 });
        pago = respuesta.data;
    } catch (error) {
        if (error.response && error.response.status === 402) {
            // Pago rechazado: regla de negocio, no una falla técnica
            const motivo = error.response.data.error;
            console.log(`[${NOMBRE}] Pedido rechazado: ${motivo}`);

            // Comunicación Asíncrona 2: avisar el rechazo sin bloquear la respuesta
            await publicarEvento(EVENTOS.PEDIDO_RECHAZADO, canal, {
                eventId: crypto.randomUUID(), usuarioId, productoId, cantidad, canal, motivo, fecha: new Date().toISOString()
            });

            return res.status(402).json({ error: 'Pedido rechazado.', detalle: motivo });
        }

        // ms-pagos caído o con error inesperado
        console.error(`[${NOMBRE}] ms-pagos no disponible:`, error.message);
        return res.status(503).json({
            error: 'Servicio de pagos no disponible. Intente nuevamente.',
            detalle: error.message
        });
    }

    // 2. Proceso principal: guardar el pedido confirmado (persistencia simulada)
    const pedidoId = `PED-${crypto.randomUUID()}`;
    const nuevoPedido = {
        eventId: crypto.randomUUID(), pedidoId, usuarioId, productoId, cantidad, canal,
        transaccionId: pago.transaccionId,
        fecha: new Date().toISOString()
    };
    console.log(`[${NOMBRE}] Pedido creado exitosamente: ${pedidoId}`);

    // 3. Comunicación Asíncrona 1: cocina, notificaciones y auditoría reaccionan en segundo plano
    const eventoPublicado = await publicarEvento(EVENTOS.PEDIDO_CREADO, canal, nuevoPedido);

    return res.status(201).json({
        mensaje: 'Pedido procesado con éxito.',
        pedido: nuevoPedido,
        eventoPublicado
    });
});

app.listen(port, () => {
    console.log(`[${NOMBRE}] Escuchando en http://localhost:${port}`);
});
