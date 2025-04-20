document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const messageDiv = document.getElementById('message');
    const limpiarBtn = document.getElementById('limpiarBtn');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');

    // Configuración inicial del botón
    togglePasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
    togglePasswordBtn.setAttribute('aria-label', 'Mostrar contraseña');
    togglePasswordBtn.style.cursor = 'pointer';
    
    // Función para mostrar/ocultar contraseña
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

    // Evento para el botón de mostrar/ocultar
    togglePasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        togglePassword();
        passwordInput.focus(); // Mantener el foco en el input
    });

    // Evento para el formulario de login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = passwordInput.value;
        
        // Limpiar mensajes anteriores
        messageDiv.innerHTML = '';
        
        // Mostrar carga
        messageDiv.innerHTML = `
            <div class="alert alert-info alert-dismissible fade show">
                <strong>Verificando...</strong> Por favor espere.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        axios.post('http://127.0.0.1:3000/login', {
            username: username,
            password: password
        })
        .then(function (response) {
            // Limpiar mensaje de carga
            messageDiv.innerHTML = '';
            
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                
                // Alerta de éxito con animación
                messageDiv.innerHTML = `
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <h4 class="alert-heading">¡Bienvenido, ${response.data.username}!</h4>
                        <p>Has iniciado sesión correctamente como <strong>${response.data.role}</strong>.</p>
                        <hr>
                        <p class="mb-0">Redirigiendo a tu panel...</p>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                `;
                
                // Redirección según rol
                setTimeout(() => {
                    switch(response.data.role.toLowerCase().trim()) {
                        case 'admin':
                            window.location.href = 'html/admin.html';
                            break;
                        case 'estudiante':
                            window.location.href = 'html/estudiantes.html';
                            break;
                        case 'estudiante2':
                            window.location.href = 'html/estudiantes2.html';
                            break;
                        case 'enfermeria':
                            window.location.href = 'html/enfermeria.html';
                            break;
                        case 'psicologo':
                            window.location.href = 'html/psicologos.html';
                            break;
                        default:
                            messageDiv.innerHTML += `
                                <div class="alert alert-warning alert-dismissible fade show">
                                    <strong>Rol no reconocido:</strong> ${response.data.role}. Contacte al administrador.
                                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                                </div>
                            `;
                    }
                }, 2000);
                
            } else {
                // Credenciales incorrectas
                messageDiv.innerHTML = `
                    <div class="alert alert-danger alert-dismissible fade show">
                        <strong>¡Error de autenticación!</strong> ${response.data.message || 'Usuario o contraseña incorrectos'}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                `;
            }
        })
        .catch(function (error) {
            console.error('Error:', error);
            
            let errorMessage = 'Error al intentar iniciar sesión';
            
            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Usuario o contraseña incorrectos';
                } else if (error.response.status === 404) {
                    errorMessage = 'Usuario no registrado';
                } else {
                    errorMessage = error.response.data.message || `Error del servidor (${error.response.status})`;
                }
            } else if (error.request) {
                errorMessage = 'No se pudo conectar al servidor';
            }
            
            messageDiv.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show">
                    <strong>¡Error!</strong> ${errorMessage}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            
            loginForm.classList.add('animate__animated', 'animate__headShake');
            setTimeout(() => {
                loginForm.classList.remove('animate__animated', 'animate__headShake');
            }, 1000);
        });
    });

    limpiarBtn.addEventListener('click', function() {
        loginForm.reset();
        messageDiv.innerHTML = '';
        // Restablecer el icono del ojo
        passwordInput.type = 'password';
        togglePasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
        togglePasswordBtn.setAttribute('aria-label', 'Mostrar contraseña');
    });
});