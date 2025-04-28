document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://localhost:3000';
    const token = localStorage.getItem('authToken');
    // Configuración global de Axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    // Función para mostrar alertas personalizadas
    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `custom-alert ${type}`;
        alertDiv.innerHTML = `
            <div class="alert-content">
                <span class="alert-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : '!'}</span>
                <span class="alert-message">${message}</span>
                <span class="alert-close">&times;</span>
            </div>
        `;
        document.body.appendChild(alertDiv);
        // Estilos dinámicos
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.padding = '15px 25px';
        alertDiv.style.backgroundColor = type === 'success' ? '#4CAF50' : 
                                          type === 'error' ? '#F44336' : '#2196F3';
        alertDiv.style.color = 'white';
        alertDiv.style.borderRadius = '4px';
        alertDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.animation = 'slideIn 0.3s forwards';
        // Cerrar alerta manualmente
        alertDiv.querySelector('.alert-close').addEventListener('click', () => {
            alertDiv.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => alertDiv.remove(), 300);
        });
        // Auto cerrar en 5 segundos
        setTimeout(() => {
            alertDiv.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => alertDiv.remove(), 300);
        }, 5000);
    }
    // Función para contar usuarios
    async function updateUserCount() {
        try {
            const response = await axios.get(`${apiUrl}/getAll`);
            document.getElementById('userCount').textContent = response.data.length;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            document.getElementById('userCount').textContent = '0';
        }
    }
    // Función para contar citas
    async function updateAppointmentCount() {
        try {
            const response = await axios.get(`${apiUrl}/estadisticas_citas`);
            if (response.data && response.data.success) {
                const total = (response.data.total_psicologia || 0) + (response.data.total_enfermeria || 0);
                document.getElementById('totalCitas').textContent = total;
            }
        } catch (error) {
            console.error('Error al obtener citas:', error);
            document.getElementById('totalCitas').textContent = '0';
        }
    }
    // Función para cargar usuarios en la tabla
    async function loadUserList() {
        try {
            const response = await axios.get(`${apiUrl}/getAll`);
            const tableBody = document.querySelector('#dataTable tbody');
            tableBody.innerHTML = '';
            response.data.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.nombre}</td>
                    <td>${user.identificacion}</td>
                    <td>${user.correo}</td>
                    <td>${user.telefono}</td>
                    <td>${user.username}</td>
                    <td>${user.rol}</td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="editUser(${user.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            showAlert('Error al cargar usuarios', 'error');
        }
    }
    // Agregar nuevo usuario
    document.getElementById('userForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const userData = {
                nombre: formData.get('nombre'),
                identificacion: formData.get('identificacion'),
                correo: formData.get('correo'),
                telefono: formData.get('telefono'),
                username: formData.get('username'),
                password: formData.get('password'),
                rol: formData.get('rol')
            };
            // Validación rápida
            if (Object.values(userData).some(value => !value)) {
                showAlert('Todos los campos son obligatorios', 'error');
                return;
            }
            const response = await axios.post(`${apiUrl}/add_contact`, JSON.stringify(userData));
            showAlert('Usuario creado exitosamente', 'success');
            loadUserList();
            updateUserCount();
            e.target.reset();
        } catch (error) {
            console.error('Error al crear usuario:', error);
            showAlert('Error al crear usuario', 'error');
        }
    });
    // Función para cargar los datos de un usuario a editar
    window.editUser = async function(userId) {
        try {
            const response = await axios.get(`${apiUrl}/getAllById/${userId}`);
            const user = response.data[0];
            if (!user) {
                showAlert('Usuario no encontrado', 'error');
                return;
            }
            document.getElementById('updateId').value = user.id;
            document.getElementById('updateNombre').value = user.nombre;
            document.getElementById('updateIdentificacion').value = user.identificacion;
            document.getElementById('updateCorreo').value = user.correo;
            document.getElementById('updateTelefono').value = user.telefono;
            document.getElementById('updateUsername').value = user.username;
            document.getElementById('updateRol').value = user.rol;
            document.querySelector('[data-tab="updateUser"]').click();
            showAlert(`La información del usuario ha sido cargada correctamente. Por favor, proceda a la sección de actualización para realizar los cambios necesarios.`, 'success');
        } catch (error) {
            console.error('Error al cargar usuario:', error);
            showAlert(`La información del usuario ha sido cargada correctamente. Por favor, proceda a la sección de actualización para realizar los cambios necesarios.`, 'success');
        }
    };
    // Actualizar usuario
    document.getElementById('updateForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const userId = formData.get('id');
            const userData = {
                nombre: formData.get('nombre'),
                identificacion: formData.get('identificacion'),
                correo: formData.get('correo'),
                telefono: formData.get('telefono'),
                username: formData.get('username'),
                rol: formData.get('rol')
            };
            const newPassword = formData.get('password');
            if (newPassword && newPassword.trim() !== '') {
                userData.password = newPassword;
            }
            await axios.put(`${apiUrl}/update/${userId}`, JSON.stringify(userData));
            showAlert('Usuario actualizado exitosamente', 'success');
            loadUserList();
            document.querySelector('[data-tab="userList"]').click();
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            showAlert('Error al actualizar usuario', 'error');
        }
    });
    // Eliminar usuario
    window.deleteUser = async function(userId) {
        if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
        try {
            await axios.delete(`${apiUrl}/delete/${userId}`);
            showAlert('Usuario eliminado exitosamente', 'success');
            loadUserList();
            updateUserCount();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            showAlert('Error al eliminar usuario', 'error');
        }
    };
    // Botones de descarga de reportes
    function setupDownloadButtons() {
        const btnCitas = document.getElementById('downloadCitasBtn');
        if (btnCitas) {
            btnCitas.addEventListener('click', function(e) {
                e.preventDefault();
                showAlert('Descargando reporte de citas', 'success');
                window.location.href = `${apiUrl}/exportar_reporte_citas`;
            });
        }
        const btnRecs = document.getElementById('downloadRecsBtn');
        if (btnRecs) {
            btnRecs.addEventListener('click', function(e) {
                e.preventDefault();
                showAlert('Descargando reporte de recomendaciones', 'success');
                window.location.href = `${apiUrl}/exportar_reporte_recomendaciones`;
            });
        }
    }
    // Inicialización
    updateUserCount();
    updateAppointmentCount();
    loadUserList();
    setupDownloadButtons();
    setInterval(() => {
        updateUserCount();
        updateAppointmentCount();
    }, 300000); // Cada 5 minutos
});
// Estilos animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .custom-alert {
        font-family: Arial, sans-serif;
        min-width: 300px;
        max-width: 400px;
        transition: all 0.3s ease;
    }
    .alert-content {
        display: flex;
        align-items: center;
    }
    .alert-icon {
        margin-right: 10px;
        font-size: 1.2em;
    }
    .alert-close {
        margin-left: auto;
        cursor: pointer;
        font-size: 1.5em;
    }
`;
document.head.appendChild(style);