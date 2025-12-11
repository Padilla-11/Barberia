// Smooth scroll para los enlaces del menú
document.addEventListener('DOMContentLoaded', function() {
    // Navegación suave
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Solo aplicar smooth scroll si es un ancla interna
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Efecto parallax suave en el hero
    /*
    window.addEventListener('scroll', function() {
    const scrollPosition = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero && scrollPosition < window.innerHeight) {
        // Solo aplica parallax mientras el hero está visible
        hero.style.transform = `translateY(${scrollPosition * 0.5}px)`;
    }
    });
    */
    
    // Animación del botón de agendar
    const btnAgendar = document.querySelector('.btn-agendar');
    
    
    // Cambio de estilo de navbar al hacer scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 1)';
            navbar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    });
    
    // Animación de entrada para el contenido del hero
    const heroContent = document.querySelector('.hero-content');
    
    if (heroContent) {
        setTimeout(() => {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(30px)';
            heroContent.style.transition = 'all 1s ease-out';
            
            setTimeout(() => {
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }, 100);
        }, 100);
    }

    // === CARRUSEL DE PRODUCTOS ===
    const carrusel = document.querySelector('.productos-container');
    const btnPrev = document.querySelector('.btn-carrusel.prev');
    const btnNext = document.querySelector('.btn-carrusel.next');

    // Verificar que todos los elementos existan
    if (carrusel && btnPrev && btnNext) {
        // Botón anterior (←)
        btnPrev.addEventListener('click', () => {
            carrusel.scrollBy({
                left: -300, // desplazamiento hacia la izquierda
                behavior: 'smooth'
            });
        });

        // Botón siguiente (→)
        btnNext.addEventListener('click', () => {
            carrusel.scrollBy({
                left: 300, // desplazamiento hacia la derecha
                behavior: 'smooth'
            });
        });
    }

    // Llamar a la función de partículas decorativas
    createParticles();
    
    // Cargar carrito y productos desde MongoDB
    cargarProductosDesdeDB();
    cargarCarrito();
    actualizarCarrito();
});

// Función para crear efecto de partículas (opcional - decorativo)
function createParticles() {
    const hero = document.querySelector('.hero');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: white;
            opacity: ${Math.random() * 0.5};
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${5 + Math.random() * 10}s infinite ease-in-out;
        `;
        hero.appendChild(particle);
    }
}

// ===========================
// SISTEMA DE CARRITO DE COMPRAS (CON MONGODB)
// ===========================

let carrito = [];
let productosDisponibles = []; // Guardar productos desde MongoDB

// Cargar productos desde el backend
async function cargarProductosDesdeDB() {
    try {
        const respuesta = await fetch('http://localhost:5000/api/productos');
        productosDisponibles = await respuesta.json();
        console.log('✅ Productos cargados desde MongoDB:', productosDisponibles);
    } catch (error) {
        console.error('❌ Error al cargar productos:', error);
    }
}

// Abrir/Cerrar carrito
const iconCart = document.getElementById('iconCart');
const carritoPanel = document.getElementById('carritoPanel');
const carritoOverlay = document.getElementById('carritoOverlay');
const cerrarCarrito = document.getElementById('cerrarCarrito');

if (iconCart) {
    iconCart.addEventListener('click', () => {
        carritoPanel.classList.add('active');
        carritoOverlay.classList.add('active');
    });
}

if (cerrarCarrito) {
    cerrarCarrito.addEventListener('click', cerrarCarritoPanel);
}

if (carritoOverlay) {
    carritoOverlay.addEventListener('click', cerrarCarritoPanel);
}

function cerrarCarritoPanel() {
    carritoPanel.classList.remove('active');
    carritoOverlay.classList.remove('active');
}

// Agregar producto al carrito desde los botones
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-agregar')) {
        const productoCard = e.target.closest('.producto');
        const nombre = productoCard.querySelector('.producto-nombre').textContent;
        const precioTexto = productoCard.querySelector('.producto-precio').textContent;
        const precio = parseInt(precioTexto.replace(/\D/g, ''));
        const imagenClase = productoCard.querySelector('.producto-image').classList[1];

        agregarAlCarrito(nombre, precio, imagenClase);
    }
});

function agregarAlCarrito(nombre, precio, imagen) {
    // Verificar si el producto ya existe en el carrito
    const productoExistente = carrito.find(item => item.nombre === nombre);
    
    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            nombre: nombre,
            precio: precio,
            imagen: imagen,
            cantidad: 1
        });
    }
    
    guardarCarrito();
    actualizarCarrito();
    
    // Abrir el carrito automáticamente
    carritoPanel.classList.add('active');
    carritoOverlay.classList.add('active');
}

// Actualizar la visualización del carrito
function actualizarCarrito() {
    const carritoBody = document.getElementById('carritoBody');
    const carritoVacio = document.getElementById('carritoVacio');
    const carritoFooter = document.getElementById('carritoFooter');
    const cartBadge = document.getElementById('cartBadge');
    const carritoTotal = document.getElementById('carritoTotal');
    
    // Calcular total de items
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    // Actualizar badge
    if (totalItems > 0) {
        cartBadge.style.display = 'flex';
        cartBadge.textContent = totalItems;
    } else {
        cartBadge.style.display = 'none';
    }
    
    // Mostrar carrito vacío o con productos
    if (carrito.length === 0) {
        carritoBody.innerHTML = `
            <div class="carrito-vacio">
                <div class="carrito-vacio-icono">🛒</div>
                <p class="carrito-vacio-texto">Tu carrito está vacío</p>
            </div>
        `;
        carritoFooter.style.display = 'none';
    } else {
        carritoFooter.style.display = 'block';
        
        // Renderizar items del carrito
        carritoBody.innerHTML = carrito.map((item, index) => `
            <div class="carrito-item">
                <div class="carrito-item-imagen ${item.imagen}"></div>
                <div class="carrito-item-info">
                    <div class="carrito-item-nombre">${item.nombre}</div>
                    <div class="carrito-item-precio">$${item.precio.toLocaleString('es-CO')}</div>
                    <div class="carrito-item-controles">
                        <button class="carrito-item-btn" onclick="cambiarCantidad(${index}, -1)">-</button>
                        <span class="carrito-item-cantidad">${item.cantidad}</span>
                        <button class="carrito-item-btn" onclick="cambiarCantidad(${index}, 1)">+</button>
                        <button class="carrito-item-eliminar" onclick="eliminarDelCarrito(${index})">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Calcular total
        const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        carritoTotal.textContent = `$${total.toLocaleString('es-CO')}`;
    }
}

// Cambiar cantidad de un producto
function cambiarCantidad(index, cambio) {
    carrito[index].cantidad += cambio;
    
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }
    
    guardarCarrito();
    actualizarCarrito();
}

// Eliminar producto del carrito
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito();
    actualizarCarrito();
}

// Vaciar carrito completo
const btnVaciar = document.getElementById('btnVaciar');
if (btnVaciar) {
    btnVaciar.addEventListener('click', () => {
        if (confirm('¿Estás seguro de vaciar el carrito?')) {
            carrito = [];
            guardarCarrito();
            actualizarCarrito();
        }
    });
}

// Finalizar compra
const btnFinalizar = document.getElementById('btnFinalizar');
if (btnFinalizar) {
    btnFinalizar.addEventListener('click', async () => {
        if (carrito.length === 0) {
            mostrarNotificacion('Tu carrito está vacío', false);
            return;
        }
        
        const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        
        // Crear pedido para enviar a MongoDB
        const pedido = {
            productos: carrito,
            total: total,
            fecha: new Date()
        };
        
        try {
            // Enviar pedido al backend
            const respuesta = await fetch('http://localhost:5000/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedido)
            });
            
            const datos = await respuesta.json();
            
            if (respuesta.ok) {
                console.log('✅ Pedido guardado en MongoDB:', datos);
                
                // Mostrar notificación de éxito
                mostrarNotificacion(`¡Pedido confirmado! Total: $${total.toLocaleString('es-CO')}`, true);
                
                // Vaciar carrito después de 2 segundos
                setTimeout(() => {
                    carrito = [];
                    guardarCarrito();
                    actualizarCarrito();
                    cerrarCarritoPanel();
                }, 2000);
            } else {
                throw new Error(datos.mensaje || 'Error al procesar pedido');
            }
            
        } catch (error) {
            console.error('❌ Error al crear pedido:', error);
            mostrarNotificacion('Error al procesar tu pedido. Intenta de nuevo.', false);
        }
    });
}

// Guardar carrito en localStorage
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Cargar carrito desde localStorage
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
}

// Función para mostrar notificación elegante
function mostrarNotificacion(mensaje, exito = true) {
    const notificacion = document.getElementById('notificacion');
    const notificacionMensaje = document.getElementById('notificacion-mensaje');
    
    if (!notificacion) {
        // Si no existe el elemento de notificación, usar alert como fallback
        alert(mensaje);
        return;
    }
    
    notificacionMensaje.textContent = mensaje;
    
    // Cambiar color según éxito o error
    if (exito) {
        notificacion.style.borderLeftColor = '#4caf50';
        const icono = notificacion.querySelector('.notificacion-icono');
        if (icono) {
            icono.style.background = '#4caf50';
            icono.textContent = '✓';
        }
    } else {
        notificacion.style.borderLeftColor = '#ff4444';
        const icono = notificacion.querySelector('.notificacion-icono');
        if (icono) {
            icono.style.background = '#ff4444';
            icono.textContent = '✕';
        }
    }
    
    // Mostrar notificación
    notificacion.classList.add('show');
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notificacion.classList.remove('show');
    }, 3000);
}

// (Opcional) desplazamiento automático del carrusel cada pocos segundos
// Descomenta este bloque si deseas que se mueva solo:
//
// setInterval(() => {
//     const carrusel = document.querySelector('.productos-container');
//     if (carrusel) {
//         carrusel.scrollBy({
//             left: 300,
//             behavior: 'smooth'
//         });
//     }
// }, 4000);

// AGREGAR ESTE CÓDIGO AL FINAL DE TU DOMContentLoaded en script.js

// ============================================
// SECCIÓN DE RESERVA FIJA
// ============================================

const seccionReserva = document.getElementById('reserva');
const formReservaSimple = document.getElementById('formReservaSimple');
const btnCancelarReserva = document.getElementById('btnCancelarReserva');
const notificacionReservaSimple = document.getElementById('notificacionReservaSimple');

// Obtener todos los botones que muestran la sección de reserva
const botonesAgendar = document.querySelectorAll('.btn-agendar, .btn-reserva');

// Mostrar sección de reserva al hacer clic
botonesAgendar.forEach(boton => {
    boton.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarSeccionReserva();
    });
});

function mostrarSeccionReserva() {
    seccionReserva.style.display = 'flex';
    // Scroll suave a la sección
    seccionReserva.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    
    // Establecer fecha mínima
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    
    const fechaMinima = `${año}-${mes}-${dia}T${horas}:${minutos}`;
    document.getElementById('fechaHoraReserva').min = fechaMinima;
}

function ocultarSeccionReserva() {
    seccionReserva.style.display = 'none';
    formReservaSimple.reset();
}

// Botón cancelar
if (btnCancelarReserva) {
    btnCancelarReserva.addEventListener('click', () => {
        ocultarSeccionReserva();
        // Volver al contacto
        document.getElementById('contacto').scrollIntoView({
            behavior: 'smooth'
        });
    });
}

// Validar horario (7 AM - 6 PM)
function validarHorarioReserva(fechaHora) {
    const fecha = new Date(fechaHora);
    const hora = fecha.getHours();
    return hora >= 7 && hora < 18;
}

// Manejar envío del formulario
if (formReservaSimple) {
    formReservaSimple.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('nombreReserva').value.trim();
        const telefono = document.getElementById('telefonoReserva').value.trim();
        const fechaHora = document.getElementById('fechaHoraReserva').value;
        const comentarios = document.getElementById('comentariosReserva').value.trim();
        
        // Validaciones
        if (nombre === '') {
            alert('Por favor ingresa tu nombre');
            return;
        }
        
        if (telefono === '' || telefono.length < 7) {
            alert('Por favor ingresa un teléfono válido');
            return;
        }
        
        if (fechaHora === '') {
            alert('Por favor selecciona fecha y hora');
            return;
        }
        
        if (!validarHorarioReserva(fechaHora)) {
            alert('Por favor selecciona un horario entre 7:00 AM y 6:00 PM');
            return;
        }
        
        // Procesar reserva
        console.log('Reserva confirmada:', {
            nombre,
            telefono,
            fechaHora,
            comentarios
        });
        
        // Mostrar notificación
        mostrarNotificacionReservaSimple();
        
        // Ocultar sección y limpiar formulario
        setTimeout(() => {
            ocultarSeccionReserva();
            document.getElementById('inicio').scrollIntoView({
                behavior: 'smooth'
            });
        }, 2000);
    });
}

// Mostrar notificación de éxito
function mostrarNotificacionReservaSimple() {
    if (notificacionReservaSimple) {
        notificacionReservaSimple.classList.add('mostrar');
        
        setTimeout(() => {
            notificacionReservaSimple.classList.remove('mostrar');
        }, 4000);
    }

}
