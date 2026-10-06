const { QUEUES, BINDINGS, EVENTOS, iniciarConsumer } = require('./rabbitmq');

const NOMBRE = 'ms-notificaciones';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Lógica de negocio: boleta/comprobante o aviso de rechazo por correo, según el evento.
async function notificar(pedido, key) {
    if (key.startsWith(EVENTOS.PEDIDO_RECHAZADO)) {
        console.log(`[${NOMBRE}] Pedido rechazado (producto ${pedido.productoId}): ${pedido.motivo}`);
        console.log(`[${NOMBRE}] Enviando correo de rechazo al usuario: ${pedido.usuarioId}...`);
    } else {
        console.log(`[${NOMBRE}] Recibido evento asíncrono (${key}) para el pedido: ${pedido.pedidoId}`);
        console.log(`[${NOMBRE}] Generando boleta y enviando correo de confirmación al usuario: ${pedido.usuarioId}...`);
    }

    // Simulación de envío de correo
    await sleep(1000);
    console.log(`[${NOMBRE}] Correo enviado exitosamente.`);
}

iniciarConsumer({
    nombre: NOMBRE,
    queue: QUEUES.NOTIFICACIONES,
    bindings: [BINDINGS.PEDIDO_CREADO, BINDINGS.PEDIDO_RECHAZADO],
    handler: notificar
}).catch((error) => {
    console.error(`[${NOMBRE}] Error iniciando el consumer:`, error.message);
    process.exit(1);
});
