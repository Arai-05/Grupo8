const { QUEUES, BINDINGS, iniciarConsumer } = require('./rabbitmq');

const NOMBRE = 'ms-auditoria';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Lógica de negocio: registrar la venta para análisis.
async function registrarVenta(pedido) {
    console.log(`[${NOMBRE}] Registrando la venta del pedido ${pedido.pedidoId} en la base de datos de análisis...`);

    // Simulación de guardado del registro de auditoría
    await sleep(500);

    console.log(`[${NOMBRE}] Registro de auditoría guardado (usuario: ${pedido.usuarioId}, producto: ${pedido.productoId}, cantidad: ${pedido.cantidad}, canal: ${pedido.canal}).`);
}

iniciarConsumer({
    nombre: NOMBRE,
    queue: QUEUES.AUDITORIA,
    bindings: [BINDINGS.PEDIDO_CREADO],
    handler: registrarVenta
}).catch((error) => {
    console.error(`[${NOMBRE}] Error iniciando el consumer:`, error.message);
    process.exit(1);
});
