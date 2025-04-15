document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const messageDiv = document.getElementById('message');
    const limpiarBtn = document.getElementById('limpiarBtn');
    const togglePasswordBtn = document.getElementById('togglePassword');
    
    // Función para mostrar mensajes estilizados
    function showMessage(message, type = 'error') {
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'warning' ? 'fa-exclamation-triangle' : 
                    'fa-exclamation-circle';
        
        messageDiv.innerHTML = `
            <div class="message ${type}">
                <i class="fas ${icon}"></i>
                <span>${message}</span>
                <i class="fas fa-times close-btn"></i>
            </div>
        `;
        
        // Configurar evento para cerrar mensaje
        messageDiv.querySelector('.close-btn').addEventListener('click', () => {
            messageDiv.innerHTML = '';
        });
        
        // Auto-ocultar mensajes después de 5 segundos (excepto éxito)
        if (type !== 'success') {
            setTimeout(() => {
                if (messageDiv.innerHTML !== '') {
                    messageDiv.innerHTML = '';
                }
            }, 5000);
        }
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
       
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Validación básica
        if (!username || !password) {
            showMessage('Por favor complete todos los campos', 'error');
            return;
        }
       
        // Mostrar mensaje de carga
        showMessage('Verificando credenciales...', 'info');
       
        axios.post('http://127.0.0.1:3000/login', {
            username: username,
            password: password
        })
        .then(function (response) {
            console.log('Respuesta del servidor:', response.data);
            
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                showMessage(`Bienvenido, ${response.data.username}. Tu rol es: ${response.data.role}`, 'success');
                
                // Redirección por rol
                setTimeout(() => {
                    const role = response.data.role.trim().toLowerCase();
                    switch(role) {
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
                            showMessage('Rol no reconocido. Contacte al administrador.', 'warning');
                            console.log('Rol no reconocido:', role);
                    }
                }, 1500); // Retraso para mostrar el mensaje
            } else {
                showMessage('Usuario o contraseña incorrectos', 'error');
            }
        })
        .catch(function (error) {
            console.error('Error:', error);
            showMessage('Error al intentar iniciar sesión. Usuario o contraseña inválida', 'error');
        });
    });
    
    limpiarBtn.addEventListener('click', function() {
        loginForm.reset();
        messageDiv.innerHTML = '';
    });
    
    // Función para alternar visibilidad de contraseña
    function togglePassword() {
        const passwordInput = document.getElementById('password');
        const togglePasswordIcon = document.getElementById('togglePassword');
       
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePasswordIcon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            togglePasswordIcon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }
    
    // Asignar evento al botón de mostrar contraseña
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePassword);
    }
});
