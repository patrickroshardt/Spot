// Array de eventos - solo eventos creados por usuarios
const eventos = [];

// Variables globales
let eventosFiltrados = [...eventos];
let categoriaActual = 'todos';
let seccionActual = 'eventos';
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
let perfilUsuario = JSON.parse(localStorage.getItem('perfilUsuario')) || {
    nombre: 'Usuario',
    email: 'usuario@ejemplo.com',
    telefono: '',
    ciudad: '',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
};

// Elementos del DOM
const eventsGrid = document.getElementById('eventsGrid');
const misEventosGrid = document.getElementById('misEventosGrid');
const misEventosEmpty = document.getElementById('misEventosEmpty');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const navLinks = document.querySelectorAll('.nav-link');
const modal = document.getElementById('eventModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close');
const profileModal = document.getElementById('profileModal');
const profileForm = document.getElementById('profileForm');

// Debug: verificar elementos
console.log('Elementos encontrados:');
console.log('navLinks:', navLinks.length);
console.log('eventsGrid:', eventsGrid);
console.log('misEventosGrid:', misEventosGrid);
console.log('profileModal:', profileModal);

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Cargar todos los eventos guardados (incluyendo los del usuario)
    const savedAllEvents = localStorage.getItem('allEvents');
    if (savedAllEvents) {
        const allEvents = JSON.parse(savedAllEvents);
        eventos = allEvents; // Reemplazar con todos los eventos guardados
    } else {
        // Si no hay eventos guardados, cargar solo los eventos del usuario
        const savedUserEvents = localStorage.getItem('userEvents');
        if (savedUserEvents) {
            const userEvents = JSON.parse(savedUserEvents);
            eventos = [...eventos, ...userEvents];
        }
    }
    
    renderEventos();
    renderMisEventos();
    actualizarPerfil();
    setupEventListeners();
    initializeUser();
});

// Configurar event listeners
function setupEventListeners() {
    // Búsqueda
    searchInput.addEventListener('input', function(e) {
        filtrarEventos(e.target.value);
    });

    // Filtros por categoría
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar active al botón clickeado
            this.classList.add('active');
            
            categoriaActual = this.dataset.category;
            filtrarEventos(searchInput.value);
        });
    });

    // Modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Cerrar modal al hacer click fuera
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeEventModal();
        }
        if (e.target === profileModal) {
            profileModal.style.display = 'none';
        }
        if (e.target === document.getElementById('createEventModal')) {
            closeCreateEventModal();
        }
    });

    // Navegación entre secciones
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const seccion = this.dataset.section;
            console.log('Navegando a sección:', seccion);
            mostrarSeccion(seccion);
            
            // Actualizar navegación activa
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Formulario de perfil
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarPerfil();
        });
    }
}

// Función para filtrar eventos
function filtrarEventos(terminoBusqueda) {
    let eventosFiltrados = eventos;
    
    // Filtrar por categoría
    if (categoriaActual !== 'todos') {
        eventosFiltrados = eventosFiltrados.filter(evento => evento.categoria === categoriaActual);
    }
    
    // Filtrar por término de búsqueda
    if (terminoBusqueda) {
        eventosFiltrados = eventosFiltrados.filter(evento => 
            evento.titulo.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
            evento.descripcion.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
            evento.ubicacion.toLowerCase().includes(terminoBusqueda.toLowerCase())
        );
    }
    
    renderEventos(eventosFiltrados);
}

// Función para renderizar eventos
function renderEventos(eventosParaMostrar = eventos) {
    if (!eventsGrid) return;
    
    eventsGrid.innerHTML = '';
    
    if (eventosParaMostrar.length === 0) {
        eventsGrid.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-times"></i>
                <h3>No hay eventos disponibles</h3>
                <p>¡Sé el primero en crear un evento!</p>
                <button class="btn-create-event" onclick="showCreateEventModal()">
                    <i class="fas fa-plus"></i> Crear Mi Primer Evento
                </button>
            </div>
        `;
        return;
    }
    
    eventosParaMostrar.forEach(evento => {
        const eventCard = createEventCard(evento);
        eventsGrid.appendChild(eventCard);
    });
}

// Función para crear tarjeta de evento
function createEventCard(evento) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    const fechaFormateada = new Date(evento.fecha).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const categoriaCapitalizada = evento.categoria.charAt(0).toUpperCase() + evento.categoria.slice(1);
    const esFavorito = favoritos.includes(evento.id);
    
    card.innerHTML = `
        <div class="event-image" style="background-image: url('${evento.imagen}');">
            <button class="favorite-btn ${esFavorito ? 'favorited' : ''}" onclick="toggleFavorito(${evento.id}, event)">
                <i class="fas fa-heart"></i>
            </button>
            <div class="event-category">${categoriaCapitalizada}</div>
        </div>
        <div class="event-content">
            <h4 class="event-title">${evento.titulo}</h4>
            <div class="event-date">
                <i class="fas fa-calendar"></i>
                ${fechaFormateada} - ${evento.hora}
            </div>
            <div class="event-location">
                <i class="fas fa-map-marker-alt"></i>
                ${evento.ubicacion}
            </div>
            <div class="event-price">
                ${evento.precios ? 
                    evento.precios.map(p => `${p.tipo}: $${p.precio.toFixed(2)}`).join(' | ') :
                    formatPrice(evento.precio)
                }
            </div>
            <p class="event-description">${evento.descripcion}</p>
            <button class="btn-details" onclick="abrirModal(${evento.id})">
                Ver Detalles
            </button>
        </div>
    `;
    
    return card;
}

// Función para abrir modal de evento
function abrirModal(eventoId) {
    const evento = eventos.find(e => e.id === eventoId);
    if (!evento) return;
    
    const fechaFormateada = new Date(evento.fecha).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const categoriaCapitalizada = evento.categoria.charAt(0).toUpperCase() + evento.categoria.slice(1);
    
    modalBody.innerHTML = `
        <div class="modal-event-image" style="background-image: url('${evento.imagen}');">
            <div class="modal-event-category">${categoriaCapitalizada}</div>
        </div>
        <div class="modal-event-info">
            <h2>${evento.titulo}</h2>
            <div class="modal-info-item">
                <i class="fas fa-calendar"></i>
                <span>${fechaFormateada} - ${evento.hora}</span>
            </div>
            <div class="modal-info-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>${evento.ubicacion}</span>
            </div>
            <div class="modal-info-item">
                <i class="fas fa-dollar-sign"></i>
                <span>
                    ${evento.precios ? 
                        evento.precios.map(p => `${p.tipo}: $${p.precio.toFixed(2)}`).join(' | ') :
                        formatPrice(evento.precio)
                    }
                </span>
            </div>
            <div class="modal-info-item">
                <i class="fas fa-building"></i>
                <span>${evento.empresa || 'Usuario Individual'}</span>
            </div>
            <p class="modal-description">${evento.descripcion}</p>
        </div>
        ${evento.metodosPago && evento.metodosPago.length > 0 ? `
        <div class="modal-payment-methods">
            <h3>Métodos de Pago:</h3>
            <div class="payment-methods">
                ${evento.metodosPago.map(metodo => `
                    <span class="payment-method" title="${metodo.charAt(0).toUpperCase() + metodo.slice(1)}">
                        <i class="${getPaymentMethodIcon(metodo)}"></i>
                    </span>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <button class="btn-buy" onclick="${evento.precio === 'Gratis' ? 'registerForFreeEvent(' + evento.id + ')' : 'showPaymentModal(' + evento.id + ')'}">
            <i class="fas fa-ticket-alt"></i>
            ${evento.precio === 'Gratis' ? 'Registrarse' : 'Comprar Entrada'}
        </button>
    `;

    modal.style.display = 'block';
}

function renderMisEventos() {
    try {
        const misEventosGrid = document.getElementById('misEventosGrid');
        const misEventosEmpty = document.getElementById('misEventosEmpty');
        
        if (!misEventosGrid || !misEventosEmpty) {
            console.error('Elementos de mis eventos no encontrados');
            return;
        }
        
        const misEventos = eventos.filter(evento => evento.creadoPorUsuario);
        console.log('Eventos creados por usuario:', misEventos.length);
        
        if (misEventos.length === 0) {
            misEventosGrid.style.display = 'none';
            misEventosEmpty.style.display = 'block';
        } else {
            misEventosGrid.style.display = 'grid';
            misEventosEmpty.style.display = 'none';
            
            misEventosGrid.innerHTML = '';
            
            misEventos.forEach(evento => {
                const eventCard = createEventCard(evento);
                misEventosGrid.appendChild(eventCard);
            });
        }
    } catch (error) {
        console.error('Error en renderMisEventos:', error);
    }
}

// Funciones de navegación
function mostrarSeccion(seccion) {
    try {
        // Ocultar todas las secciones
        const eventosSection = document.getElementById('eventos');
        const misEventosSection = document.getElementById('mis-eventos');
        const perfilSection = document.getElementById('perfil');
        
        if (eventosSection) eventosSection.style.display = 'none';
        if (misEventosSection) misEventosSection.style.display = 'none';
        if (perfilSection) perfilSection.style.display = 'none';
        
        // Mostrar sección seleccionada
        const targetSection = document.getElementById(seccion);
        if (targetSection) {
            targetSection.style.display = 'block';
            seccionActual = seccion;
            
            // Actualizar contenido según la sección
            if (seccion === 'mis-eventos') {
                renderMisEventos();
            } else if (seccion === 'perfil') {
                actualizarPerfil();
            }
        }
    } catch (error) {
        console.error('Error en mostrarSeccion:', error);
    }
}

// Funciones de perfil
function actualizarPerfil() {
    try {
        console.log('Actualizando perfil...');
        // Solo actualizar si el usuario está logueado
        if (currentUser && isLoggedIn) {
            updateProfileData();
            loadUserTickets();
            loadUserSpending();
        }
    } catch (error) {
        console.error('Error en actualizarPerfil:', error);
    }
}

// Función para alternar favorito
function toggleFavorito(eventoId, event) {
    event.stopPropagation();
    
    const index = favoritos.indexOf(eventoId);
    if (index > -1) {
        favoritos.splice(index, 1);
    } else {
        favoritos.push(eventoId);
    }
    
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    renderEventos();
}

function editProfile() {
    // Llenar formulario con datos actuales
    document.getElementById('editName').value = perfilUsuario.nombre;
    document.getElementById('editEmail').value = perfilUsuario.email;
    document.getElementById('editPhone').value = perfilUsuario.telefono;
    document.getElementById('editCity').value = perfilUsuario.ciudad;
    
    // Mostrar modal
    profileModal.style.display = 'block';
}

function closeProfileModal() {
    profileModal.style.display = 'none';
}

function guardarPerfil() {
    perfilUsuario.nombre = document.getElementById('editName').value;
    perfilUsuario.email = document.getElementById('editEmail').value;
    perfilUsuario.telefono = document.getElementById('editPhone').value;
    perfilUsuario.ciudad = document.getElementById('editCity').value;
    
    localStorage.setItem('perfilUsuario', JSON.stringify(perfilUsuario));
    closeProfileModal();
    actualizarPerfil();
}

function changeAvatar() {
    const avatares = [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
    ];
    
    const avatarActual = avatares.indexOf(perfilUsuario.avatar);
    const nuevoAvatar = avatares[(avatarActual + 1) % avatares.length];
    
    perfilUsuario.avatar = nuevoAvatar;
    localStorage.setItem('perfilUsuario', JSON.stringify(perfilUsuario));
    actualizarPerfil();
}

function openSettings() {
    alert('Configuración disponible próximamente');
}

// Función para registrar en eventos gratuitos
function registerForFreeEvent(eventId) {
    const evento = eventos.find(e => e.id === eventId);
    if (!evento) {
        alert('Evento no encontrado');
        return;
    }

    const customerName = prompt('Ingresa tu nombre completo:');
    const customerEmail = prompt('Ingresa tu email:');
    const customerPhone = prompt('Ingresa tu teléfono:');

    if (!customerName || !customerEmail || !customerPhone) {
        alert('Por favor completa todos los campos');
        return;
    }

    // Guardar registro
    const registration = {
        eventId: eventId,
        eventName: evento.titulo,
        customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone
        },
        date: new Date().toISOString(),
        type: 'free'
    };

    let registrations = JSON.parse(localStorage.getItem('freeRegistrations')) || [];
    registrations.push(registration);
    localStorage.setItem('freeRegistrations', JSON.stringify(registrations));

    alert(`¡Registro exitoso para ${evento.titulo}! Te enviaremos más información por email.`);
}

// Funciones para crear evento desde la app
function showCreateEventModal() {
    // Verificar que el usuario sea empresario
    if (!currentUser || currentUser.type !== 'empresario') {
        alert('Solo los empresarios pueden crear eventos. Inicia sesión como empresario para crear eventos.');
        return;
    }
    
    const modal = document.getElementById('createEventModal');
    modal.style.display = 'block';
}

function closeCreateEventModal() {
    const modal = document.getElementById('createEventModal');
    if (modal) {
        modal.style.display = 'none';
        // Limpiar formulario
        const form = document.getElementById('createEventForm');
        if (form) {
            form.reset();
        }
    }
}

function closeEventModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function createEventFromApp(e) {
    e.preventDefault();
    
    // Verificar que el usuario sea empresario
    if (currentUser && currentUser.type !== 'empresario') {
        alert('Solo los empresarios pueden crear eventos');
        return;
    }
    
    // Obtener precios múltiples
    const priceGroups = document.querySelectorAll('.price-input-group');
    const precios = [];
    priceGroups.forEach(group => {
        const type = group.querySelector('.price-type').value;
        const value = parseFloat(group.querySelector('.price-value').value);
        if (type && value) {
            precios.push({ tipo: type, precio: value });
        }
    });
    
    // Obtener imagen
    let imagen = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    const imageFile = document.getElementById('newEventImage').files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagen = e.target.result;
        };
        reader.readAsDataURL(imageFile);
    }
    
    const newEvent = {
        id: Date.now(),
        titulo: document.getElementById('newEventTitle').value,
        empresa: currentUser ? currentUser.name : 'Usuario Individual',
        fecha: document.getElementById('newEventDate').value,
        hora: document.getElementById('newEventTime').value,
        ubicacion: document.getElementById('newEventLocation').value,
        precios: precios,
        categoria: document.getElementById('newEventCategory').value,
        imagen: imagen,
        descripcion: document.getElementById('newEventDescription').value,
        metodosPago: ['tarjeta', 'efectivo', 'transferencia'],
        contacto: document.getElementById('newEventContact').value,
        fechaCreacion: new Date().toISOString(),
        activo: true,
        creadoPorUsuario: true,
        creadoPorEmpresario: currentUser && currentUser.type === 'empresario'
    };
    
    // Agregar a la lista de eventos
    eventos.push(newEvent);
    
    // Guardar TODOS los eventos (incluyendo los del usuario)
    localStorage.setItem('allEvents', JSON.stringify(eventos));
    
    // También guardar solo los eventos del usuario para "Mis Eventos"
    localStorage.setItem('userEvents', JSON.stringify(eventos.filter(e => e.creadoPorUsuario)));
    
    // Cerrar modal y limpiar formulario
    closeCreateEventModal();
    document.getElementById('createEventForm').reset();
    document.getElementById('imagePreview').style.display = 'none';
    
    // Recargar eventos
    renderEventos();
    renderMisEventos();
    
    alert('¡Evento creado exitosamente! Aparecerá en la lista de eventos.');
}

// Sistema de Login
let currentUser = null;
let isLoggedIn = false;
let userType = 'cliente'; // 'cliente' o 'empresario'

// Verificar si hay usuario logueado al cargar
function initializeUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        userType = currentUser.type || 'cliente';
        showProfileSection();
    } else {
        showLoginSection();
    }
}

function login(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simular login (en una app real, esto sería una llamada a API)
    if (email && password) {
        currentUser = {
            id: Date.now(),
            email: email,
            name: email.split('@')[0],
            type: userType,
            loginDate: new Date().toISOString()
        };
        
        isLoggedIn = true;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showProfileSection();
        updateProfileData();
        loadUserTickets();
        loadUserSpending();
        
        alert(`¡Inicio de sesión exitoso como ${userType === 'empresario' ? 'Empresario' : 'Cliente'}!`);
    } else {
        alert('Por favor completa todos los campos');
    }
}

function logout() {
    currentUser = null;
    isLoggedIn = false;
    localStorage.removeItem('currentUser');
    showLoginSection();
    alert('Sesión cerrada');
}

function showLoginSection() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('profileSection').style.display = 'none';
}

function showProfileSection() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('profileSection').style.display = 'block';
}

function showRegister() {
    alert('Funcionalidad de registro próximamente disponible');
}

// Funciones para manejar tipo de usuario
function selectUserType(type, button) {
    userType = type;
    
    // Actualizar botones
    document.querySelectorAll('.user-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
}

// Funciones para manejar imagen
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            const img = document.getElementById('previewImg');
            img.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    document.getElementById('newEventImage').value = '';
    document.getElementById('imagePreview').style.display = 'none';
}

// Funciones para manejar precios múltiples
function addPriceField() {
    const container = document.getElementById('pricesContainer');
    const priceGroup = document.createElement('div');
    priceGroup.className = 'price-input-group';
    priceGroup.innerHTML = `
        <input type="text" placeholder="Tipo (ej: VIP)" class="price-type" required>
        <input type="number" placeholder="Precio" step="0.01" class="price-value" required>
        <button type="button" onclick="removePrice(this)" class="remove-price-btn">×</button>
    `;
    container.appendChild(priceGroup);
}

function removePrice(button) {
    button.parentElement.remove();
}

// Función para obtener iconos de métodos de pago
function getPaymentMethodIcon(method) {
    const icons = {
        'tarjeta': 'fas fa-credit-card',
        'efectivo': 'fas fa-money-bill-wave',
        'transferencia': 'fas fa-university',
        'paypal': 'fab fa-paypal',
        'bitcoin': 'fab fa-bitcoin'
    };
    return icons[method] || 'fas fa-credit-card';
}

// Función para formatear precios
function formatPrice(price) {
    if (typeof price === 'number') {
        return `$${price.toFixed(2)}`;
    }
    return price;
}

function updateProfileData() {
    if (currentUser) {
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileEmail').textContent = currentUser.email;
    }
}

function loadUserTickets() {
    const tickets = JSON.parse(localStorage.getItem('userTickets')) || [];
    const ticketsList = document.getElementById('ticketsList');
    const noTickets = document.getElementById('noTickets');
    
    if (tickets.length === 0) {
        ticketsList.style.display = 'none';
        noTickets.style.display = 'block';
    } else {
        ticketsList.style.display = 'block';
        noTickets.style.display = 'none';
        ticketsList.innerHTML = '';
        
        tickets.forEach(ticket => {
            const ticketItem = document.createElement('div');
            ticketItem.className = 'ticket-item';
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <div class="ticket-title">${ticket.eventName}</div>
                    <div class="ticket-status ${ticket.status}">${ticket.status === 'valid' ? 'Válida' : 'Usada'}</div>
                </div>
                <div class="ticket-details">
                    <div>Fecha: ${ticket.eventDate}</div>
                    <div>Hora: ${ticket.eventTime}</div>
                    <div>Ubicación: ${ticket.eventLocation}</div>
                    <div>ID: ${ticket.ticketId}</div>
                </div>
            `;
            ticketsList.appendChild(ticketItem);
        });
    }
    
    // Actualizar contador
    document.getElementById('ticketsOwned').textContent = tickets.length;
}

function loadUserSpending() {
    const sales = JSON.parse(localStorage.getItem('spotSales')) || [];
    const userSales = sales.filter(sale => sale.customer && sale.customer.email === currentUser.email);
    
    const totalSpent = userSales.reduce((sum, sale) => sum + sale.amount, 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlySales = userSales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
    
    const monthlySpent = monthlySales.reduce((sum, sale) => sum + sale.amount, 0);
    
    document.getElementById('totalSpent').textContent = `$${totalSpent.toFixed(2)}`;
    document.getElementById('totalSpending').textContent = `$${totalSpent.toFixed(2)}`;
    document.getElementById('monthlySpending').textContent = `$${monthlySpent.toFixed(2)}`;
    
    // Actualizar eventos asistidos
    document.getElementById('eventsAttended').textContent = userSales.length;
}

// Función para agregar ticket cuando se compra
function addUserTicket(saleData) {
    if (!currentUser) return;
    
    const ticket = {
        ticketId: saleData.transactionId,
        eventName: saleData.eventName,
        eventDate: saleData.eventDate,
        eventTime: saleData.eventTime,
        eventLocation: saleData.eventLocation,
        status: 'valid',
        purchaseDate: new Date().toISOString()
    };
    
    let tickets = JSON.parse(localStorage.getItem('userTickets')) || [];
    tickets.push(ticket);
    localStorage.setItem('userTickets', JSON.stringify(tickets));
    
    loadUserTickets();
    loadUserSpending();
}

// Función de navegación directa
function navigateToSection(sectionName, clickedElement) {
    console.log('Navegando a:', sectionName);
    
    // Prevenir scroll automático
    if (clickedElement) {
        clickedElement.preventDefault && clickedElement.preventDefault();
    }
    
    // Ocultar todas las secciones
    const sections = ['eventos', 'mis-eventos', 'perfil'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.style.display = 'block';
        console.log('Sección mostrada:', sectionName);
        
        // Scroll al inicio de la página
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Actualizar contenido según la sección
        if (sectionName === 'mis-eventos') {
            renderMisEventos();
        } else if (sectionName === 'perfil') {
            actualizarPerfil();
        }
    } else {
        console.error('No se encontró la sección:', sectionName);
    }
    
    // Actualizar navegación activa
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    if (clickedElement) {
        clickedElement.classList.add('active');
    }
    
    return false; // Prevenir comportamiento por defecto
}
