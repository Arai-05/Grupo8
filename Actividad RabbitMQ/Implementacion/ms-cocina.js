const { QUEUES, BINDINGS, iniciarConsumer } = require('./rabbitmq');

const NOMBRE = 'ms-cocina';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Lógica de negocio: proyectar la orden confirmada en la comanda de la barra.
async function prepararOrden(pedido, key) {
    console.log(`[${NOMBRE}] Orden recibida (${key}): pedido ${pedido.pedidoId}`);
    console.log(`[${NOMBRE}] Comanda -> producto: ${pedido.productoId}, cantidad: ${pedido.cantidad}, canal: ${pedido.canal}`);

    // Simulación de despliegue en la pantalla del barista
    await sleep(800);
    console.log(`[${NOMBRE}] Orden ${pedido.pedidoId} desplegada en la comanda de la barra.`);
}

iniciarConsumer({
    nombre: NOMBRE,
    queue: QUEUES.COCINA,
    bindings: [BINDINGS.PEDIDO_CREADO],
    handler: prepararOrden
}).catch((error) => {
    console.error(`[${NOMBRE}] Error iniciando el consumer:`, error.message);
    process.exit(1);
});
