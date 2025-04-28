document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginForm = document.getElementById('login-form');
    const messageDiv = document.getElementById('message');
    const limpiarBtn = document.getElementById('limpiarBtn');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const usernameInput = document.getElementById('username');

    // Configuración inicial
    function initializeLogin() {
        passwordInput.type = 'password';
        togglePasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
        togglePasswordBtn.setAttribute('aria-label', 'Mostrar contraseña');
        togglePasswordBtn.style.cursor = 'pointer';
        loginForm.reset();
        messageDiv.innerHTML = '';
    }

    // Función para normalizar roles
    function normalizeRole(role) {
        if (!role) return 'unknown';
        
        const roleLower = role.toLowerCase().trim();
        const roleMap = {
            'admin': 'admin',
            'admin2': 'admin',
            'administrador': 'admin',
            'enfermero': 'enfermeria',
            'enfermera': 'enfermeria',
            'nurse': 'enfermeria',
            'estudiante': 'estudiante',
            'student': 'estudiante',
            'estudiante2': 'estudiante2',
            'psicologo': 'psicologo',
            'psychologist': 'psicologo'
        };
        
        return roleMap[roleLower] || roleLower;
    }

    // Mostrar/ocultar contraseña
    function togglePassword() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePasswordBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            togglePasswordBtn.setAttribute('aria-label', 'Ocultar contraseña');
        } else {
            passwordInput.type = 'password';
            togglePasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
            togglePasswordBtn.setAttribute('aria-label', 'Mostrar contraseña');
        }
    }

    // Mostrar estado de carga
    function showLoading() {
        messageDiv.innerHTML = `
            <div class="alert alert-info alert-dismissible fade show">
                <div class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <strong>Verificando credenciales...</strong> Por favor espere.
            </div>
        `;
    }

    // Mostrar mensaje de éxito
    function showSuccess(username, role) {
        const roleDisplayNames = {
            'admin': 'Administrador',
            'enfermeria': 'Enfermería',
            'estudiante': 'Estudiante',
            'psicologo': 'Psicólogo'
        };
        
        const displayRole = roleDisplayNames[role] || role;
        
        messageDiv.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <h4 class="alert-heading">¡Bienvenido/a, ${username}!</h4>
                <p>Has iniciado sesión correctamente como <strong>${displayRole}</strong>.</p>
                <div class="progress mt-2">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" 
                         style="width: 100%"></div>
                </div>
            </div>
        `;
    }

    // Mostrar error
    function showError(message = 'Error en la autenticación', isWarning = false) {
        const alertType = isWarning ? 'alert-warning' : 'alert-danger';
        messageDiv.innerHTML = `
            <div class="alert ${alertType} alert-dismissible fade show">
                <strong>${isWarning ? 'Advertencia:' : '¡Error!'}</strong> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        loginForm.classList.add('animate__animated', 'animate__headShake');
        setTimeout(() => {
            loginForm.classList.remove('animate__animated', 'animate__headShake');
        }, 1000);
    }

    // Redirigir según rol
    function redirectByRole(role) {
        const normalizedRole = normalizeRole(role);
        const redirectPaths = {
            'admin': 'html/admin.html',
            'admin2': 'html/admin.html',
            'enfermeria': 'html/enfermeria.html',
            'estudiante': 'html/estudiantes.html',
            'estudiante2': 'html/estudiantes2.html',
            'psicologo': 'html/psicologos.html'
        };
        
        if (redirectPaths[normalizedRole]) {
            setTimeout(() => {
                window.location.href = redirectPaths[normalizedRole];
            }, 2000);
        } else {
            showError(`Rol no reconocido: ${role}. Contacte al administrador.`, true);
        }
    }

    // Event Listeners
    togglePasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        togglePassword();
        passwordInput.focus();
    });

    limpiarBtn.addEventListener('click', function() {
        initializeLogin();
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Validación de campos
        if (!username || !password) {
            showError('Por favor complete todos los campos');
            return;
        }
        
        // Mostrar estado de carga
        showLoading();
        
        // Enviar credenciales al servidor
        axios.post('http://127.0.0.1:3000/login', {
            username: username,
            password: password
        })
        .then(function(response) {
            if (response.data.success) {
                // Almacenar token
                localStorage.setItem('token', response.data.token);
                
                // Mostrar mensaje de éxito
                showSuccess(response.data.username, normalizeRole(response.data.role));
                
                // Redirigir según rol
                redirectByRole(response.data.role);
            } else {
                showError(response.data.message || 'Usuario o contraseña incorrectos');
            }
        })
        .catch(function(error) {
            console.error('Error:', error);
            
            let errorMessage = 'Error al intentar iniciar sesión';
            
            if (error.response) {
                errorMessage = error.response.data.message || 
                             `Error del servidor (${error.response.status})`;
            } else if (error.request) {
                errorMessage = 'No se pudo conectar al servidor';
            }
            
            showError(errorMessage);
        });
    });

    // Inicializar
    initializeLogin();
});