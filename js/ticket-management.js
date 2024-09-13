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
function iniciarCronometro(ticketId) {
    let tiempoTranscurrido = 0;

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

    tickets = tickets.filter(serie => serie !== document.getElementById(`serie-${ticketId}`).textContent);
}

// Agregar ticket
function agregarTicket(usuario, serie, falla, tecnico) {
    if (tickets.includes(serie)) {
        alert('Ya existe un ticket con esta serie de equipo.');
        return;
    }

    tickets.push(serie);
    contadorTickets++;
    const ticketId = contadorTickets;

    const ticketHTML = `
        <div class="col-md-4" data-ticket-id="${ticketId}">
            <div class="card border-primary h-100">
                <div class="card-body">
                    <h5 class="card-title">Ticket #${ticketId}</h5>
                    <p class="card-text"><strong>Nombre del responsable:</strong> ${usuario}</p>
                    <p class="card-text"><strong>Serie del Equipo:</strong> <span id="serie-${ticketId}">${serie}</span></p>
                    <p class="card-text"><strong>Falla del equipo:</strong> ${falla}</p>
                    <p class="card-text"><strong>Técnico Asignado:</strong> ${tecnico}</p>
                    <p id="timer-${ticketId}" class="timer green">Tiempo: 0m 0s</p>
                    <div class="ticket-actions mt-3">
                        <button onclick="finalizarTicket(${ticketId})" class="btn btn-danger me-2">Finalizar</button>
                        <button onclick="eliminarTicket(${ticketId})" class="btn btn-secondary">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('ticketList').insertAdjacentHTML('beforeend', ticketHTML);
    iniciarCronometro(ticketId);
}

// Evento para el formulario de tickets
document.getElementById('ticketForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const usuario = document.getElementById('userName').value.trim();
    const serie = document.getElementById('serie').value.trim();
    const falla = document.getElementById('falla').value.trim();
    const tecnico = document.getElementById('tecnico').value.trim();

    if (usuario === '') {
        alert('Por favor, ingrese el nombre del responsable.');
        return;
    }

    if (serie === '') {
        alert('Por favor, ingrese la serie del equipo.');
        return;
    }

    if (falla === '') {
        alert('Por favor, seleccione la falla del equipo.');
        return;
    }

    if (tecnico === '') {
        alert('Por favor, seleccione un técnico.');
        return;
    }

    agregarTicket(usuario, serie, falla, tecnico);
    document.getElementById('ticketForm').reset();
});
