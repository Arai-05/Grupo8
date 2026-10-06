// Capa de infraestructura: toda la configuración y el acceso a RabbitMQ viven aquí.
// Los microservicios (ms-*.js) solo contienen lógica de negocio.
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE_NAME = 'pedidos.exchange';
const EXCHANGE_TYPE = 'topic';

// Routing keys jerárquicas: <entidad>.<evento>.<canal>
const EVENTOS = {
    PEDIDO_CREADO: 'pedido.creado',
    PEDIDO_RECHAZADO: 'pedido.rechazado'
};

const CANALES = ['caja', 'web'];

// Patrones de binding (# = cero o más palabras)
const BINDINGS = {
    PEDIDO_CREADO: `${EVENTOS.PEDIDO_CREADO}.#`,
    PEDIDO_RECHAZADO: `${EVENTOS.PEDIDO_RECHAZADO}.#`
};

const QUEUES = {
    COCINA: 'cocina.queue',
    NOTIFICACIONES: 'notificaciones.queue',
    AUDITORIA: 'auditoria.queue'
};

// Ej: routingKey('pedido.creado', 'caja') => 'pedido.creado.caja'
const routingKey = (evento, canal) => `${evento}.${canal}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Conecta con reintentos: permite levantar los servicios antes que RabbitMQ.
async function conectar(nombre, reintentos = 10, esperaMs = 2000) {
    for (let intento = 1; intento <= reintentos; intento++) {
        try {
            return await amqp.connect(RABBITMQ_URL);
        } catch (error) {
            console.error(`[${nombre}] No se pudo conectar a RabbitMQ (intento ${intento}/${reintentos}): ${error.message || error.code || "conexión rechazada"}`);
            if (intento === reintentos) throw error;
            await sleep(esperaMs);
        }
    }
}

// ---------- Producer ----------

let publisher = null; // { connection, channel }

async function obtenerPublisher(nombre) {
    if (publisher) return publisher.channel;

    // El producer atiende requests HTTP: pocos reintentos para no dejar al cliente esperando.
    const connection = await conectar(nombre, 3, 1000);
    const channel = await connection.createConfirmChannel();
    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });

    connection.on('close', () => { publisher = null; });
    connection.on('error', (error) => console.error(`[${nombre}] Error de conexión RabbitMQ:`, error.message));

    publisher = { connection, channel };
    console.log(`[${nombre}] Producer conectado a ${EXCHANGE_NAME} (${EXCHANGE_TYPE})`);
    return channel;
}

// Publica con confirmación del broker. Rechaza la promesa si RabbitMQ no confirma.
async function publicar(nombre, key, payload) {
    const channel = await obtenerPublisher(nombre);
    const contenido = Buffer.from(JSON.stringify(payload));

    await new Promise((resolve, reject) => {
        channel.publish(
            EXCHANGE_NAME,
            key,
            contenido,
            { persistent: true, contentType: 'application/json' },
            (error) => (error ? reject(error) : resolve())
        );
    });
    console.log(`[${nombre}] Evento publicado (${key}):`, payload);
}

// ---------- Consumer ----------

// Declara exchange, cola y bindings, y consume con ack/nack.
// handler(payload, routingKey) lanza error => mensaje descartado con nack.
async function iniciarConsumer({ nombre, queue, bindings, handler, prefetch = 1 }) {
    const connection = await conectar(nombre);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });
    const q = await channel.assertQueue(queue, { durable: true });
    for (const patron of bindings) {
        await channel.bindQueue(q.queue, EXCHANGE_NAME, patron);
    }
    await channel.prefetch(prefetch);

    connection.on('error', (error) => console.error(`[${nombre}] Error de conexión RabbitMQ:`, error.message));
    connection.on('close', () => {
        console.error(`[${nombre}] Conexión cerrada, terminando proceso.`);
        process.exit(1);
    });

    console.log(`[${nombre}] Esperando mensajes en ${q.queue} (bindings: ${bindings.join(', ')})`);

    await channel.consume(q.queue, async (msg) => {
        if (msg === null) return;

        let payload;
        try {
            payload = JSON.parse(msg.content.toString());
        } catch (error) {
            console.error(`[${nombre}] Mensaje inválido, descartado:`, error.message);
            channel.nack(msg, false, false);
            return;
        }

        try {
            await handler(payload, msg.fields.routingKey);
            channel.ack(msg);
        } catch (error) {
            console.error(`[${nombre}] Error procesando mensaje, descartado:`, error.message);
            channel.nack(msg, false, false);
        }
    });
}

module.exports = { EVENTOS, CANALES, BINDINGS, QUEUES, routingKey, publicar, iniciarConsumer };
