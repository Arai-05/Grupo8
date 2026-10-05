const express = require('express');
const axios = require('axios');
const amqp = require('amqplib');

const app = express();
const port = 3000;

app.use(express.json());

const RABBITMQ_URL = 'amqp://localhost';
const EXCHANGE_NAME = 'pedidos.exchange';
const ROUTING_KEY = 'pedido.creado';

// Función para conectar y publicar en RabbitMQ
async function publicarEventoRabbitMQ(pedido) {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        
        // Declaramos el exchange tipo direct
        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
        
        const payload = Buffer.from(JSON.stringify(pedido));
        
        // Publicar el mensaje
        channel.publish(EXCHANGE_NAME, ROUTING_KEY, payload);
        console.log(`[ms-pedidos] Evento asíncrono publicado: ${ROUTING_KEY}`, pedido);
        
        // Cerrar la conexión después de un momento para dar tiempo a que se envíe
        setTimeout(() => {
            channel.close();
            connection.close();
        }, 500);
    } catch (error) {
        console.error('[ms-pedidos] Error publicando en RabbitMQ:', error.message);
    }
}

// Endpoint principal de creación de pedido
app.post('/api/pedidos', async (req, res) => {
    const { usuarioId, productoId, cantidad } = req.body;
    
    console.log(`[ms-pedidos] Recibida solicitud de pedido - Usuario: ${usuarioId}, Producto: ${productoId}`);
    
    try {
        // 1. Comunicación Síncrona: Validar stock
        // Esta operación DEBE ser síncrona porque necesitamos saber si hay stock
        // ANTES de confirmar el pedido al cliente.
        console.log(`[ms-pedidos] Iniciando comunicación síncrona con ms-validacion...`);
        const responseValidacion = await axios.get(`http://localhost:3001/api/validacion/stock/${productoId}`);
        
        if (responseValidacion.data.valid) {
            // 2. Proceso Principal: Crear el pedido en BD (Simulado)
            const pedidoId = `PED-${Math.floor(Math.random() * 10000)}`;
            const nuevoPedido = { pedidoId, usuarioId, productoId, cantidad, fecha: new Date().toISOString() };
            console.log(`[ms-pedidos] Pedido creado exitosamente: ${pedidoId}`);
            
            // 3. Comunicación Asíncrona: Publicar evento
            // Acciones secundarias (ej: notificaciones, auditoría) se desacoplan para no bloquear.
            await publicarEventoRabbitMQ(nuevoPedido);
            
            // Responder al cliente inmediatamente
            return res.status(201).json({
                mensaje: 'Pedido procesado con éxito.',
                pedido: nuevoPedido
            });
        }
    } catch (error) {
        console.error(`[ms-pedidos] Error en validación síncrona:`, error.response ? error.response.data : error.message);
        return res.status(400).json({
            error: 'No se pudo procesar el pedido debido a un error de validación.',
            detalle: error.response ? error.response.data : error.message
        });
    }
});

app.listen(port, () => {
    console.log(`[ms-pedidos] Escuchando en http://localhost:${port}`);
});
