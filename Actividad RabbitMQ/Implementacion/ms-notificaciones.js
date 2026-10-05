const amqp = require('amqplib');

const RABBITMQ_URL = 'amqp://localhost';
const EXCHANGE_NAME = 'pedidos.exchange';
const QUEUE_NAME = 'notificaciones.queue';
const ROUTING_KEY = 'pedido.creado';

async function iniciarConsumer() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        
        // 1. Asegurar que el exchange existe
        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
        
        // 2. Asegurar que la queue existe
        const q = await channel.assertQueue(QUEUE_NAME, { durable: true });
        
        // 3. Crear el binding entre la queue y el exchange con la routing key
        await channel.bindQueue(q.queue, EXCHANGE_NAME, ROUTING_KEY);
        
        console.log(`[ms-notificaciones] Esperando mensajes en la cola: ${q.queue}`);
        
        // 4. Consumir mensajes
        channel.consume(q.queue, (msg) => {
            if (msg !== null) {
                const pedido = JSON.parse(msg.content.toString());
                console.log(`[ms-notificaciones] Recibido evento asíncrono para el pedido: ${pedido.pedidoId}`);
                
                // Simulación de envío de correo
                console.log(`[ms-notificaciones] Enviando correo de confirmación al usuario: ${pedido.usuarioId}...`);
                
                setTimeout(() => {
                    console.log(`[ms-notificaciones] Correo enviado exitosamente.`);
                    // Acknowledge the message
                    channel.ack(msg);
                }, 1000);
            }
        });
        
    } catch (error) {
        console.error('[ms-notificaciones] Error en el consumer:', error.message);
    }
}

iniciarConsumer();
