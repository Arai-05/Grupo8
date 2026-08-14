Contexto
Una organización pequeña llamada “cahuinLab’s” necesita una herramienta interna para registrar y dar seguimiento a incidencias técnicas sobre requerimientos de empleados: problemas de acceso, errores de aplicaciones, fallas de equipos, solicitudes de soporte y otros eventos similares con respecto a sus herramientas de trabajo.
 
Construir en equipo una aplicación fullstack sencilla que permita diagnosticar las competencias previas necesarias para abordar posteriormente prácticas cloud native sobre un sistema real.
 
Objetivos específicos
 
●       levantar requerimientos funcionales y no funcionales básicos;
●       identificar actores, datos y reglas del problema;
●       diseñar una arquitectura fullstack simple;
●       justificar decisiones arquitectónicas iniciales;
●       construir una interfaz web conectada a un backend;
●       implementar una API con operaciones CRUD;
●       persistir datos en una base de datos;
●       trabajar colaborativamente utilizando Git;
●       contenerizar los componentes del sistema;
●       levantar la solución completa con Docker Compose;
●       Documentar cómo ejecutar y verificar la aplicación.
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
Modalidad y Trabajo Colaborativo
El desarrollo de esta solución es grupal. Cada integrante del equipo debe participar activamente en el análisis, la implementación, la integración y la explicación de la solución, y el repositorio debe permitir observar contribuciones distribuidas entre los integrantes. Adicionalmente, cada estudiante debe contestar de forma individual y privada el cuestionario definido para esta actividad.
Estrategia de trabajo con Git:
Rama principal main protegida, con integración mediante Pull Requests revisados por al menos un integrante distinto del autor. Ramas de trabajo por funcionalidad (feature/nombre-funcionalidad) creadas a partir de main. Convención de commits descriptivos (ej. feat:, fix:, docs:) que referencien el requerimiento funcional asociado cuando corresponda (ej. RF-01). Se espera que el historial de commits del repositorio evidencie aportes de todos los integrantes del equipo.
 
Levantamiento de Requerimientos:
CahuinLab’s
 
Problema
La organización cahuinLab’s experimenta dificultades en la gestión y seguimiento de incidencias técnicas operativas (como problemas de acceso, fallas de equipos, errores en aplicaciones y solicitudes de soporte) reportadas por sus colaboradores. Actualmente, la falta de un canal centralizado provoca desorganización, pérdida de tiempo y baja visibilidad del estado real de los requerimientos de soporte.
 
Al no contar con una herramienta dedicada, el registro de fallas se realiza mediante canales informales y dispersos (mensajería instantánea, correos o conversaciones verbales). Esto genera traspapelo de solicitudes, duplicidad de esfuerzos, retrasos en los tiempos de respuesta y la imposibilidad de priorizar adecuadamente los problemas críticos que afectan la productividad diaria de los empleados.
 
La aplicación busca solucionar esta problemática proveyendo un sistema centralizado e intuitivo que permita registrar, actualizar, clasificar y visualizar el ciclo de vida completo de cada incidencia. Con esto se logra estandarizar la atención técnica, priorizar casos de manera clara y ofrecer trazabilidad para mejorar la eficiencia operativa global de cahuinLab’s.
Actores
Operador de Soporte
Qué necesita hacer: Registrar nuevas incidencias, consultar el listado general, ver detalles, actualizar información o estado, filtrar la lista y eliminar registros cuando corresponda.
 
Qué información utiliza: Título del problema, descripción detallada, categoría (ej. Hardware, Software, Acceso), prioridad (Baja, Media, Alta, Crítica), estado actual y fecha de creación.
 
Qué resultado espera: Un panel centralizado que le permita priorizar y gestionar el flujo de resolución de incidencias, con indicadores claros sobre el volumen de requerimientos pendientes y resueltos.
Nota de alcance: se define un único actor (Operador de Soporte) que registra y gestiona el ciclo completo de las incidencias en representación de los colaboradores que las reportan. No se contempla un portal separado de autoservicio para el colaborador final, dado que la autenticación y gestión de roles quedan explícitamente fuera de alcance (ver sección "Fuera del Alcance").
 
 
Requerimientos Funcionales
RF-01: Registrar incidencia: El sistema debe permitir registrar una nueva incidencia especificando título, descripción, categoría y prioridad.
 
RF-02: Listar incidencias: El sistema debe mostrar un listado general de todas las incidencias registradas con sus datos principales (título, categoría, prioridad, estado y fecha).
 
RF-03: Ver detalle de incidencia: El sistema debe permitir seleccionar una incidencia del listado para consultar su información completa.
 
RF-04: Actualizar incidencia: El sistema debe permitir modificar el título, la descripción, la categoría y la prioridad de una incidencia existente.
 
RF-05: Eliminar incidencia: El sistema debe permitir remover una incidencia de la base de datos previa confirmación del operador.
 
RF-06: Cambiar estado de incidencia: El sistema debe permitir modificar el estado de una incidencia (ej. ABIERTA, EN PROCESO, RESUELTA, CERRADA).
 
RF-07: Búsqueda y filtrado: El sistema debe permitir filtrar el listado por estado, categoría o prioridad, además de buscar por texto en el título.
 
RF-08: Resumen e indicadores: El sistema debe desplegar un panel con contadores de incidencias agrupados por su estado actual.
 
Requerimientos No Funcionales
RNF-01: Ejecución y reproducibilidad: La solución completa (frontend, backend y base de datos) debe ser capaz de iniciarse localmente mediante el comando docker compose up siguiendo las instrucciones del README.md.
 
RNF-02: Persistencia de datos: La información de las incidencias debe almacenarse en una base de datos utilizando volúmenes de Docker, evitando la pérdida de datos al reiniciar los contenedores.
 
RNF-03: Usabilidad y diseño adaptativo: La interfaz web debe ser intuitiva, responsiva y ofrecer mensajes claros de confirmación o error ante las acciones del usuario.
 
RNF-04: Desacoplamiento de arquitectura: La solución debe desarrollarse dividida en Frontend y Backend API, donde la interfaz consuma el backend mediante peticiones HTTP/REST estandarizadas.
 
RNF-05: Manejo estandarizado de errores: La API backend debe retornar códigos de estado HTTP válidos (ej. 200, 201, 400, 404, 500) y mensajes en formato JSON comprensibles ante errores de entrada o del servidor.
 
Reglas de Negocio
RN-01: Estado inicial automático: Toda incidencia recién creada debe asignarse de manera automática con el estado ABIERTA.
 
RN-02: Campos obligatorios: No se permitirá guardar o actualizar incidencias que no incluyan título, descripción, categoría y prioridad.
 
RN-03: Transición de cierre: Una incidencia sólo podrá ser marcada como CERRADA si previamente estuvo en estado EN PROCESO o RESUELTA.
 
RN-04: Inmutabilidad de fecha de creación: La fecha y hora de creación debe ser asignada automáticamente por el servidor al guardar la incidencia y no podrá ser modificada manualmente.
Criterios de Aceptación
Criterio 1:
Para RF-01 (Registrar incidencia)
Dado que el operador ingresó al formulario de registro y completó todos los campos obligatorios (título, descripción, categoría y prioridad),
 
Cuando presiona el botón "Guardar incidencia", entonces la incidencia queda persistida en la base de datos, y el sistema muestra un mensaje de éxito,  la nueva incidencia se visualiza al inicio del listado principal con estado ABIERTA.
Criterio 2:
Para RF-06 (Cambiar estado de incidencia)
Dado que existe una incidencia en el listado con estado ABIERTA, cuando el operador selecciona la opción de cambiar estado a EN PROCESO, entonces el estado de la incidencia se actualiza en el backend,  la interfaz refleja inmediatamente el nuevo estado sin necesidad de recargar manualmente la página y  el contador de incidencias "En Proceso" del panel de resumen se incrementa en 1.
 
Criterio 3:
Para RF-07 (Búsqueda y filtrado)
Dado que existen incidencias registradas de distintas categorías (Hardware, Software, Acceso), cuando el operador selecciona el filtro por categoría Hardware, entonces el listado se actualiza mostrando únicamente las incidencias de tipo Hardware y se ocultan temporalmente las demás categorías.
 
Alcance y Fuera de Alcance
Dentro del Alcance (In-Scope)
●       Desarrollo de una interfaz web (Frontend) interactiva.
 
●       Desarrollo de una API REST (Backend) con operaciones CRUD completas.
 
●       Base de datos relacional o no relacional contenerizada con volúmenes de persistencia.
 
●       Módulo de filtrado, búsqueda básica y contadores de resumen.
 
●       Contenerización individual mediante Dockerfile y orquestación unificada con docker-compose.
 
●       Documentación técnica de ejecución e instalación.
 
Fuera del Alcance (Out-of-Scope)
●       Autenticación y autorización de usuarios (Login, roles, JWT).
 
●       Recuperación de contraseña o gestión de cuentas de usuario.
 
●       Envío de notificaciones por correo electrónico, SMS o mensajería (Slack/Teams).
 
●       Arquitectura basada en microservicios o colas de mensajería asíncronas.
 
●       Carga y almacenamiento de archivos adjuntos (imágenes, archivos de log).
 
●       Despliegue productivo en la nube (AWS, GCP, Azure).
 
 
Arquitectura y decisiones técnicas.
 
Stack tecnológico:
 
Backend: Java 21 + Spring Boot 4.x.
Frontend: React con Vite o Next.js.
Persistencia: MySQL o PostgreSQL.
Infraestructura local: Docker + Docker Compose.
 
Diagrama de arquitectura
 
GRUPO8
├── .mvn/wrapper
└── src
	├── main
	│   ├── java/com/sistemaIncidencias/grupo8
	│   │   ├── controller
	│   │   ├── models
	│   │   ├── repository
	│   │   └── services
	│   └── resources
	└── test/java/com/sistemaIncidencias/grupo8
 
frontend
├── public
└── src
	├── components (formularios, listado, filtros, panel de resumen)
	├── pages (vistas principales: listado, detalle, registro)
	├── services (consumo de la API REST vía fetch/axios)
	└── App.jsx
 
Responsabilidades
Frontend (React)
 
Presentación e interacción: Construye la interfaz visual dinámica y gestiona la experiencia del usuario respondiendo a eventos como clics, desplazamientos o navegación.
 
Gestión de estado: Administra los datos temporales en memoria necesarios para renderizar componentes y reflejar cambios inmediatos en la pantalla.
 
Consumo de API REST: Realiza peticiones HTTP para enviar o solicitar información estructurada al servidor.
 
Validaciones de UX: Verifica la forma inicial de los datos en formularios (campos requeridos, formato de correo) para ofrecer retroalimentación instantánea sin saturar al servidor.
 
Backend (Spring Boot)
 
Exposición de Endpoints REST: Habilita las rutas de acceso de la aplicación para comunicarse con el cliente mediante peticiones web.
 
Reglas de negocio y validación: Procesa la información enviada, aplica las políticas del dominio, evalúa permisos y garantiza que los datos cumplan las normas requeridas antes de ser procesados.
 
Coordinación con la persistencia: Traduce la lógica de la aplicación en operaciones de lectura, escritura o modificación de datos (habitualmente mediante JPA/Hibernate).
 
Respuestas HTTP y manejo de errores: Controla los fallos de ejecución y devuelve respuestas estandarizadas con sus respectivos códigos de estado (200, 400, 404, 500).
 
Base de Datos
 
Almacenamiento persistente: Guarda la información del sistema de manera permanente para que no se pierda al reiniciar la aplicación o el servidor.
 
Integridad básica de datos: Mantiene la coherencia de los registros mediante reglas estructurales como llaves primarias, llaves foráneas, campos únicos y transacciones ACID.
 
Decisiones arquitectónicas obligatorias
React + Vite (frontend): se elige Vite por sobre Next.js porque el alcance del proyecto es una SPA simple sin necesidad de renderizado en servidor, rutas API propias ni SEO; Vite entrega un entorno de desarrollo más liviano, con arranque y recarga en caliente casi instantáneos, lo que agiliza el ciclo de desarrollo dado el tiempo acotado del diagnóstico.

JavaScript (sin TypeScript): se opta por JavaScript puro para reducir la curva de configuración inicial y mantener el foco del equipo en las competencias evaluadas (integración fullstack, CRUD, contenerización) por sobre el tipado estático, dado el tamaño acotado del CRUD y el equipo.

MySQL (persistencia): se elige MySQL por sobre PostgreSQL por la familiaridad del equipo con el motor y su integración directa con Spring Data JPA/Hibernate; el modelo de datos de la incidencia es plano y relacional simple (sin necesidad de tipos avanzados o JSON nativo), por lo que las capacidades adicionales de PostgreSQL no aportan valor al alcance definido.

Java 21 + Spring Boot (backend): se elige por la solidez de su ecosistema para exponer APIs REST con validación de datos, manejo estandarizado de errores HTTP y persistencia vía JPA/Hibernate, además de ser el stack con el que el equipo tiene mayor experiencia previa, lo que reduce el riesgo de implementación dado el tiempo disponible.
 
 
 
 
