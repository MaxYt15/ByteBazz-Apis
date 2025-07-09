// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCR0pZ05ouTScwY8c90BQP4LCyQrHsaK6Q",
    authDomain: "bytebazz-apis.firebaseapp.com",
    databaseURL: "https://bytebazz-apis-default-rtdb.firebaseio.com",
    projectId: "bytebazz-apis",
    storageBucket: "bytebazz-apis.firebasestorage.app",
    messagingSenderId: "480135965859",
    appId: "1:480135965859:web:40567753bc972fe7182316",
    measurementId: "G-MYS6QLP6K6"
}; // SOLO debe quedar esta declaración en TODO el archivo

// Inicialización única de Firebase y variables globales
firebase.initializeApp(firebaseConfig);
firebase.analytics();
let auth = firebase.auth();
let db = firebase.database();


// Variables globales
let toggleKey, apiKeyInput, copyBtn, regenerateBtn, revokeBtn, menuToggle, sidebar, overlay, mainContent;

// Función para mostrar errores al usuario
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #ff4444;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    if (document.body) {
        document.body.appendChild(errorDiv);
        
        // Eliminar el mensaje después de 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Asegurarse de que el body exista antes de agregar la notificación
    if (document.body) {
        document.body.appendChild(notification);
        
        // Eliminar la notificación después de 3 segundos
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Función para generar una API key
function generarApiKey(uid) {
    return 'bb_' + Math.random().toString(36).substr(2, 32);
}

// Función para alternar el menú
function toggleMenu() {
    if (sidebar && overlay && mainContent) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        mainContent.classList.toggle('shifted');
        
        // Guardar estado del menú
        const isOpen = sidebar.classList.contains('active');
        localStorage.setItem('sidebarOpen', isOpen);
    }
}

// Función para inicializar el menú
function initMenu() {
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', toggleMenu);
        
        // Cerrar menú al hacer clic en un enlace (en móviles)
        document.querySelectorAll('.nav-link').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 1200) {
                    toggleMenu();
                }
            });
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', toggleMenu);
    }
}

// Función para copiar la API key al portapapeles
function copyApiKey() {
    if (!apiKeyInput) return;
    const apiKey = apiKeyInput.value;
    const button = this;
    // Depuración
    console.log('Intentando copiar:', apiKey);
    // Intentar usar la API moderna
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(apiKey).then(() => {
            showCopiedFeedback(button);
            showNotification('API Key copiada al portapapeles', 'success');
        }).catch(() => {
            fallbackCopy(apiKey, button);
        });
    } else {
        fallbackCopy(apiKey, button);
    }
}

// Asegurar referencia correcta al botón Copiar
// Esto debe estar en el DOMContentLoaded o antes de setupEventListeners
// copyBtn = document.querySelector('.api-key-actions .btn');


function fallbackCopy(text, button) {
    // Fallback para navegadores antiguos
    apiKeyInput.select();
    document.execCommand('copy');
    showCopiedFeedback(button);
}

function showCopiedFeedback(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Copiado';
    setTimeout(() => {
        button.innerHTML = originalText;
    }, 2000);
}

// Función para manejar el cierre de sesión
function handleLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        if (auth) {
            auth.signOut().then(() => {
                window.location.href = 'login.html';
            }).catch((error) => {
                console.error('Error al cerrar sesión:', error);
                showError('Error al cerrar sesión');
            });
        } else {
            window.location.href = 'login.html';
        }
    }
}

// Manejar redimensionamiento de la ventana
function handleResize() {
    if (!sidebar || !mainContent || !overlay) return;

    if (window.innerWidth > 1200) {
        // En escritorio, asegurarse de que el menú no esté en modo 'active' de móvil
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        mainContent.classList.remove('shifted');
    }
}

// Configurar manejadores de eventos
function setupEventListeners() {
    // Configurar botón de copiar API key
    if (copyBtn) {
        copyBtn.addEventListener('click', copyApiKey);
    }
    
    // Configurar botón de regenerar API key
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', function() {
            const user = auth.currentUser;
            if (user) {
                const newApiKey = generarApiKey(user.uid);
                // Aquí iría el código para actualizar la API key en la base de datos
                showNotification('API key regenerada correctamente', 'success');
                if (apiKeyInput) {
                    apiKeyInput.value = newApiKey;
                }
            }
        });
    }
    
    // Configurar botón de revocar API key
    if (revokeBtn) {
        revokeBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que deseas revocar tu API key? Esto no se puede deshacer.')) {
                // Aquí iría el código para revocar la API key en la base de datos
                showNotification('API key revocada correctamente', 'success');
                if (apiKeyInput) {
                    apiKeyInput.value = '';
                }
            }
        });
    }
    
    // Configurar cierre de sesión
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', handleLogout);
    }
    
    // Configurar el botón de mostrar/ocultar contraseña
    if (toggleKey && apiKeyInput) {
        toggleKey.addEventListener('click', function() {
            const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
            apiKeyInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
}

// Función para cargar los datos del usuario
function getDatabaseKeyFromName(name) {
    return name.replace(/\s+/g, '_'); // Reemplaza espacios por _
}

function loadUserData(user) {
    if (!db || !user) return;
    const dbKey = getDatabaseKeyFromName(user.displayName);
    const userRef = db.ref('usuarios/' + dbKey);

    userRef.once('value').then(snapshot => {
        const userData = snapshot.val();
        if (userData && userData.apiKey) {
            if (apiKeyInput) {
                apiKeyInput.value = userData.apiKey;
            }
        } else {
            if (apiKeyInput) {
                apiKeyInput.value = '';
            }
            showNotification('No tienes una API key asignada. Contacta con soporte.', 'error');
        }
    }).catch(error => {
        console.error('Error al cargar datos del usuario:', error);
        showError('Error al cargar los datos del usuario');
    });
}

// Ajustar el flujo de autenticación para llamar a loadUserData(user)
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        loadUserData(user);
        // ... resto de tu lógica de autenticación
    } else {
        window.location.href = 'login.html';
    }
});

// Configuración de Firebase



// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a los elementos del DOM
    toggleKey = document.getElementById('toggle-key');
    apiKeyInput = document.getElementById('api-key');
    copyBtn = document.querySelector('.api-key-actions .btn');
    regenerateBtn = document.querySelector('.btn-outline i.fas.fa-redo')?.closest('button');
    revokeBtn = document.querySelector('.btn-outline i.far.fa-trash-alt')?.closest('button');
    menuToggle = document.getElementById('menuToggle');
    sidebar = document.getElementById('sidebar');
    overlay = document.getElementById('overlay');
    mainContent = document.querySelector('.main-content');

    // Configurar manejadores de eventos
    setupEventListeners();
    
    // Inicializar menú
    initMenu();
    
    // Manejar redimensionamiento
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Verificar autenticación
    auth.onAuthStateChanged(handleAuthStateChanged);
});

// Manejar cambios en el estado de autenticación
function handleAuthStateChanged(user) {
    if (!user) {
        // Si no hay usuario autenticado, redirigir a login
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Mostrar información del usuario
        const userName = user.displayName || user.email.split('@')[0];
        const nameElements = document.querySelectorAll('#user-name, #user-name-display');
        const avatarElement = document.querySelector('.user-avatar');
        
        nameElements.forEach(el => {
            if (el) el.textContent = userName;
        });
        
        if (avatarElement) {
            avatarElement.textContent = userName.charAt(0).toUpperCase();
        }
        
        // Cargar datos del usuario desde la base de datos
        loadUserData(user);
    } catch (error) {
        console.error('Error al manejar el estado de autenticación:', error);
        showError('Error al cargar los datos del usuario');
    }
}