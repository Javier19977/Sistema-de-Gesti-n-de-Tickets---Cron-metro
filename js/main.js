const tecnicos = [
    "Carlos Vargas", "Alexis Paniagua", "Kemdall Blanco", "Daniel Nerio",
    "Raúl Cruz", "Alexander Gómez", "Geraldina Trujillo", "David Sermeño",
    "Henry Marroquín", "William Martínez", "Carlos Rivas", "Wilber Del Cid",
    "Douglas Hernández", "Victor Latin"
];

let contadorTickets = 0;
let cronometroIntervalos = {}; // Objeto para almacenar los intervalos del cronómetro
let tickets = []; // Array para almacenar la serie de tickets existentes

// Función para formatear el tiempo en minutos y segundos
function formatearTiempo(tiempoTranscurrido) {
    const minutos = Math.floor(tiempoTranscurrido / 60);
    const segundos = tiempoTranscurrido % 60;
    return `${minutos}m ${segundos}s`;
}

// Función para actualizar el color del cronómetro según el tiempo transcurrido
function actualizarColorCronometro(tiempoTranscurrido) {
    if (tiempoTranscurrido < 5 * 60) {
        return 'timer green';
    } else if (tiempoTranscurrido < 10 * 60) {
        return 'timer yellow';
    } else {
        return 'timer red';
    }
}

// Iniciar cronómetro
function iniciarCronometro(ticketId, tiempoInicial = 0) {
    let tiempoTranscurrido = tiempoInicial;

    const interval = setInterval(() => {
        tiempoTranscurrido++;
        const timerElement = document.getElementById(`timer-${ticketId}`);
        
        if (timerElement) {
            timerElement.textContent = `Tiempo: ${formatearTiempo(tiempoTranscurrido)}`;
            timerElement.className = actualizarColorCronometro(tiempoTranscurrido);
        }
    }, 1000);

    cronometroIntervalos[ticketId] = interval; // Guardar el intervalo para poder detenerlo
}

// Finalizar ticket
function finalizarTicket(ticketId) {
    if (cronometroIntervalos[ticketId]) {
        clearInterval(cronometroIntervalos[ticketId]); // Detener el cronómetro
        delete cronometroIntervalos[ticketId]; // Eliminar el intervalo del objeto

        const timerElement = document.getElementById(`timer-${ticketId}`);
        if (timerElement) {
            timerElement.textContent += " - Finalizado";
            timerElement.className = 'timer gray'; // Cambiar color a gris para indicar que está finalizado
        }
        
        // Actualizar ticket en IndexedDB
        const ticket = tickets.find(ticket => ticket.id === ticketId);
        if (ticket) {
            ticket.estado = 'finalizado';
            ticket.tiempo = parseInt(document.getElementById(`timer-${ticketId}`).textContent.split(' ')[1]); // Actualizar tiempo
            updateTicket(ticket);
        }
    }
}

// Eliminar ticket
function eliminarTicket(ticketId) {
    if (cronometroIntervalos[ticketId]) {
        clearInterval(cronometroIntervalos[ticketId]);
        delete cronometroIntervalos[ticketId];
    }

    const ticketElement = document.querySelector(`[data-ticket-id="${ticketId}"]`);
    if (ticketElement) {
        ticketElement.remove();
    }

    // Eliminar del array de tickets
    tickets = tickets.filter(ticket => ticket.id !== ticketId);

    // Eliminar de la base de datos
    deleteTicket(ticketId)
        .then(() => console.log(`Ticket ${ticketId} eliminado de la base de datos.`))
        .catch(error => console.error(`Error al eliminar el ticket ${ticketId}:`, error));
}

// Agregar ticket
function agregarTicket(usuario, serie, falla, tecnico) {
    const ticket = { usuario, serie, falla, tecnico, estado: 'pendiente', tiempo: 0 }; // Inicializar el tiempo a 0

    addTicket(ticket)
        .then(id => {
            ticket.id = id; // Asignar el ID al ticket
            console.log('Nuevo ticket agregado con ID:', id); // Verifica el ID
            tickets.push(ticket);
            contadorTickets = Math.max(contadorTickets, id); // Asegurar que el contador de tickets esté actualizado
            mostrarTicket(ticket); // Mostrar el ticket en la interfaz
            document.getElementById('ticketForm').reset();
        })
        .catch(error => console.error('Error al agregar ticket:', error));
}

// Mostrar un ticket en la interfaz
function mostrarTicket(ticket) {
    const ticketHTML = `
        <div class="col-md-4 mb-3" data-ticket-id="${ticket.id}">
            <div class="card border-primary h-100">
                <div class="card-body">
                    <h5 class="card-title">Ticket #${ticket.id}</h5>
                    <p class="card-text"><strong>Nombre del responsable:</strong> ${ticket.usuario}</p>
                    <p class="card-text"><strong>Serie del Equipo:</strong> <span id="serie-${ticket.id}">${ticket.serie}</span></p>
                    <p class="card-text"><strong>Falla del equipo:</strong> ${ticket.falla}</p>
                    <p class="card-text"><strong>Técnico Asignado:</strong> ${ticket.tecnico}</p>
                    <p id="timer-${ticket.id}" class="timer ${ticket.estado === 'finalizado' ? 'gray' : 'green'}">Tiempo: ${formatearTiempo(ticket.tiempo)}</p>
                    <div class="ticket-actions mt-3">
                        <button onclick="finalizarTicket(${ticket.id})" class="btn btn-danger me-2" ${ticket.estado === 'finalizado' ? 'disabled' : ''}>Finalizar</button>
                        <button onclick="eliminarTicket(${ticket.id})" class="btn btn-secondary">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('ticketList').insertAdjacentHTML('beforeend', ticketHTML);
    if (ticket.estado === 'pendiente') {
        iniciarCronometro(ticket.id, ticket.tiempo); // Iniciar el cronómetro con el tiempo cargado
    }
}

// Cargar tickets desde IndexedDB al iniciar la página
function cargarTicketsDesdeIndexedDB() {
    getTickets().then(ticketsData => {
        tickets = ticketsData; // Cargar tickets en el array local
        ticketsData.forEach(ticket => {
            contadorTickets = Math.max(contadorTickets, ticket.id); // Asegurar que el contador de tickets esté actualizado
            mostrarTicket(ticket); // Mostrar el ticket en la interfaz
        });
    }).catch(error => console.error('Error al cargar tickets:', error));
}

// Evento para el formulario de tickets
document.getElementById('ticketForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const usuario = document.getElementById('userName').value.trim();
    const serie = document.getElementById('serie').value.trim();
    const falla = document.getElementById('falla').value.trim();
    const tecnico = document.getElementById('tecnico').value.trim();

    if (!usuario || !serie || !falla || !tecnico) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    agregarTicket(usuario, serie, falla, tecnico);
});

// Cargar tickets al cargar la página
window.onload = () => {
    openDB()
        .then(() => {
            cargarTicketsDesdeIndexedDB();  // Cargar los tickets existentes al cargar la página
        })
        .catch(error => console.error('Error during onload:', error));
};
