const DB_NAME = 'ticketDB';
const DB_VERSION = 1;
const TICKET_STORE_NAME = 'tickets';
const STOPWATCH_STORE_NAME = 'stopwatchState';

let db;
let stopwatchStartTime = 0;
let elapsedTime = 0;
let timerInterval = null;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(TICKET_STORE_NAME)) {
                db.createObjectStore(TICKET_STORE_NAME, { keyPath: 'id', autoIncrement: true });
                console.log('Ticket object store created.');
            }
            if (!db.objectStoreNames.contains(STOPWATCH_STORE_NAME)) {
                db.createObjectStore(STOPWATCH_STORE_NAME, { keyPath: 'id' });
                console.log('Stopwatch object store created.');
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('Database opened successfully.');
            resolve();
        };

        request.onerror = (event) => {
            console.error('Error opening database:', event.target.error);
            reject(event.target.error);
        };
    });
}

function saveStopwatchState() {
    const state = {
        id: 1,
        startTime: stopwatchStartTime,
        elapsedTime: elapsedTime
    };

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STOPWATCH_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STOPWATCH_STORE_NAME);
        const request = store.put(state);

        request.onsuccess = () => {
            console.log('Stopwatch state saved successfully.');
            resolve();
        };

        request.onerror = (event) => {
            console.error('Error saving stopwatch state:', event.target.error);
            reject(event.target.error);
        };
    });
}

function loadStopwatchState() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STOPWATCH_STORE_NAME], 'readonly');
        const store = transaction.objectStore(STOPWATCH_STORE_NAME);
        const request = store.get(1);

        request.onsuccess = (event) => {
            const data = event.target.result;
            if (data) {
                stopwatchStartTime = data.startTime;
                elapsedTime = data.elapsedTime;
                updateStopwatchDisplay();
                console.log('Stopwatch state loaded successfully.');
            } else {
                console.log('No stopwatch state found.');
            }
            resolve();
        };

        request.onerror = (event) => {
            console.error('Error loading stopwatch state:', event.target.error);
            reject(event.target.error);
        };
    });
}

function addTicket(ticket) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([TICKET_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(TICKET_STORE_NAME);
        const request = store.add(ticket);

        request.onsuccess = () => {
            console.log('Ticket added successfully.');
            resolve(request.result); // Retorna el ID generado
        };

        request.onerror = (event) => {
            console.error('Error adding ticket:', event.target.error);
            reject(event.target.error);
        };
    });
}

function getTickets() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([TICKET_STORE_NAME], 'readonly');
        const store = transaction.objectStore(TICKET_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = (event) => {
            console.log('Tickets retrieved successfully:', event.target.result);
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            console.error('Error retrieving tickets:', event.target.error);
            reject(event.target.error);
        };
    });
}

function updateTicket(ticket) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([TICKET_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(TICKET_STORE_NAME);
        const request = store.put(ticket);

        request.onsuccess = () => {
            console.log('Ticket updated successfully.');
            resolve();
        };

        request.onerror = (event) => {
            console.error('Error updating ticket:', event.target.error);
            reject(event.target.error);
        };
    });
}

function deleteTicket(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([TICKET_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(TICKET_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
            console.log('Ticket deleted successfully.');
            resolve();
        };

        request.onerror = (event) => {
            console.error('Error deleting ticket:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Función para cargar los tickets desde IndexedDB
function cargarTicketsDesdeIndexedDB() {
    getTickets().then(tickets => {
        tickets.forEach(ticket => {
            console.log('Ticket loaded: ', ticket);
            // Aquí puedes implementar cómo mostrar los tickets en la interfaz de usuario
        });
    }).catch(error => {
        console.error('Error loading tickets:', error);
    });
}

// Funciones del cronómetro
function startStopwatch() {
    stopwatchStartTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateStopwatch, 1000);
    saveStopwatchState();
}

function updateStopwatch() {
    elapsedTime = Date.now() - stopwatchStartTime;
    updateStopwatchDisplay();
    saveStopwatchState();
}

function stopStopwatch() {
    clearInterval(timerInterval);
    timerInterval = null;
    saveStopwatchState();
}

function resetStopwatch() {
    stopwatchStartTime = Date.now();
    elapsedTime = 0;
    updateStopwatchDisplay();
    saveStopwatchState();
}

function updateStopwatchDisplay() {
    const timeElapsed = elapsedTime / 1000; // Convertir de milisegundos a segundos
    console.log('Time elapsed:', formatearTiempo(timeElapsed));
}

function formatearTiempo(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = Math.floor(segundos % 60);
    return `${horas}:${minutos}:${segundosRestantes}`;
}

// Cargar el estado del cronómetro y los tickets al iniciar
window.onload = () => {
    openDB()
        .then(loadStopwatchState) // Cargar el estado del cronómetro desde IndexedDB
        .then(cargarTicketsDesdeIndexedDB) // Cargar los tickets guardados
        .catch(error => console.error('Error durante la carga inicial:', error));
};
