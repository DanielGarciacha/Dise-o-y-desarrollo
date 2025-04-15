document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://localhost:3000'; // Cambia esto según tu configuración

    // Obtener la cantidad de usuarios y mostrar en la pestaña "Inicio"
    function updateUserCount() {
        axios.get(`${apiUrl}/getAll`)
            .then(response => {
                const count = response.data.length;
                document.getElementById('userCount').textContent = count;
            })
            .catch(error => {
                console.error('Error fetching user count:', error);
                document.getElementById('userCount').textContent = '0';
            });
    }

    // Obtener el total de citas y mostrar en la pestaña "Inicio"
    function updateAppointmentCount() {
        axios.get(`${apiUrl}/estadisticas_citas`)
            .then(response => {
                if (response.data && response.data.success) {
                    const totalPsicologia = response.data.total_psicologia || 0;
                    const totalEnfermeria = response.data.total_enfermeria || 0;
                    const totalCitas = totalPsicologia + totalEnfermeria;
                    document.getElementById('totalCitas').textContent = totalCitas;
                    
                    // Opcional: Mostrar desglose por tipo
                    console.log('Citas de psicología:', totalPsicologia);
                    console.log('Citas de enfermería:', totalEnfermeria);
                } else {
                    throw new Error('Estructura de datos inválida');
                }
            })
            .catch(error => {
                console.error('Error fetching appointment stats:', error);
                document.getElementById('totalCitas').textContent = '0';
                showAlert('Error al cargar estadísticas de citas', 'error');
            });
    }

    // Obtener la lista de usuarios y mostrar en la pestaña "Lista de Usuarios"
    function loadUserList() {
        axios.get(`${apiUrl}/getAll`)
            .then(response => {
                const tableBody = document.querySelector('#dataTable tbody');
                tableBody.innerHTML = ''; // Limpiar el contenido previo
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
            })
            .catch(error => {
                console.error('Error fetching user list:', error);
                showAlert('Error al cargar la lista de usuarios', 'error');
            });
    }

    // Función para mostrar notificaciones
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '1000';
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // Agregar un nuevo usuario
    document.getElementById('userForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const userData = {
            nombre: formData.get('nombre'),
            identificacion: formData.get('identificacion'),
            correo: formData.get('correo'),
            telefono: formData.get('telefono'),
            username: formData.get('username'),
            password: formData.get('password'),
            rol: formData.get('rol')
        };
        
        axios.post(`${apiUrl}/add_contact`, userData)
            .then(response => {
                showAlert('Usuario agregado correctamente', 'success');
                loadUserList();
                updateUserCount();
                event.target.reset();
            })
            .catch(error => {
                console.error('Error adding user:', error);
                showAlert('Error al agregar usuario', 'error');
            });
    });

    // Actualizar un usuario
    document.getElementById('updateForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const userId = formData.get('id');
        const userData = {
            nombre: formData.get('nombre'),
            identificacion: formData.get('identificacion'),
            correo: formData.get('correo'),
            telefono: formData.get('telefono'),
            username: formData.get('username'),
            password: formData.get('password'),
            rol: formData.get('rol')
        };
    
        axios.put(`${apiUrl}/update/${userId}`, userData)
            .then(response => {
                showAlert('Usuario actualizado correctamente', 'success');
                loadUserList();
            })
            .catch(error => {
                console.error('Error updating user:', error);
                showAlert('Error al actualizar usuario', 'error');
            });
    });

    // Eliminar un usuario
    window.deleteUser = function(userId) {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
        
        axios.delete(`${apiUrl}/delete/${userId}`)
            .then(response => {
                showAlert('Usuario eliminado correctamente', 'success');
                loadUserList();
                updateUserCount();
            })
            .catch(error => {
                console.error('Error deleting user:', error);
                showAlert('Error al eliminar usuario', 'error');
            });
    };

    // Editar un usuario
    window.editUser = function(userId) {
        axios.get(`${apiUrl}/getAllById/${userId}`)
            .then(response => {
                if (response.data.length > 0) {
                    const user = response.data[0];
                    document.getElementById('updateId').value = user.id;
                    document.getElementById('updateNombre').value = user.nombre;
                    document.getElementById('updateIdentificacion').value = user.identificacion;
                    document.getElementById('updateCorreo').value = user.correo;
                    document.getElementById('updateTelefono').value = user.telefono;
                    document.getElementById('updateUsername').value = user.username;
                    document.getElementById('updatePassword').value = '';
                    document.getElementById('updateRol').value = user.rol;
                    
                    // Cambiar a la pestaña de actualización
                    document.querySelector('[data-tab="updateUser"]').click();
                }
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
                showAlert('Error al cargar datos del usuario', 'error');
            });
    }

    // Inicializar la página
    updateUserCount();
    updateAppointmentCount();
    loadUserList();

    // Actualizar cada 5 minutos (opcional)
    setInterval(() => {
        updateUserCount();
        updateAppointmentCount();
    }, 300000);
});

document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'http://localhost:3000';

    // === ✅ Alerta visual destacada (toast)
    function showDownloadAlert(mensaje) {
        const alertDiv = document.createElement('div');
        alertDiv.textContent = mensaje;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.padding = '15px 25px';
        alertDiv.style.backgroundColor = '#28a745'; // Verde llamativo
        alertDiv.style.color = 'white';
        alertDiv.style.fontWeight = 'bold';
        alertDiv.style.borderRadius = '8px';
        alertDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        alertDiv.style.zIndex = 9999;
        alertDiv.style.transition = 'opacity 0.5s';

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.style.opacity = 0;
            setTimeout(() => alertDiv.remove(), 500);
        }, 4000);
    }

    // === ⬇️ Evento para el botón del reporte desde el menú nav
    const btnDescargar = document.getElementById("downloadCitasBtn");
    if (btnDescargar) {
        btnDescargar.addEventListener("click", function (e) {
            e.preventDefault();
            showDownloadAlert("📥 Descargando reporte de todas las citas...");
            window.location.href = `${apiUrl}/exportar_reporte_citas`;
        });
    }
});


document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'http://localhost:3000';

    // ✅ Alerta visual destacada tipo toast
    function showDownloadAlert(mensaje) {
        const alertDiv = document.createElement('div');
        alertDiv.textContent = mensaje;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.padding = '15px 25px';
        alertDiv.style.backgroundColor = '#28a745'; // Verde
        alertDiv.style.color = 'white';
        alertDiv.style.fontWeight = 'bold';
        alertDiv.style.borderRadius = '8px';
        alertDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        alertDiv.style.zIndex = 9999;
        alertDiv.style.transition = 'opacity 0.5s';

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.style.opacity = 0;
            setTimeout(() => alertDiv.remove(), 500);
        }, 4000);
    }

    // 📥 Botón para reporte de citas
    const btnDescargarCitas = document.getElementById("downloadCitasBtn");
    if (btnDescargarCitas) {
        btnDescargarCitas.addEventListener("click", function (e) {
            e.preventDefault();
            showDownloadAlert("📥 Descargando reporte de todas las citas...");
            window.location.href = `${apiUrl}/exportar_reporte_citas`;
        });
    }

    // 📥 Botón para reporte de recomendaciones
    const btnDescargarRecs = document.getElementById("downloadRecsBtn");
    if (btnDescargarRecs) {
        btnDescargarRecs.addEventListener("click", function (e) {
            e.preventDefault();
            showDownloadAlert("📥 Descargando reporte de recomendaciones...");
            window.location.href = `${apiUrl}/exportar_reporte_recomendaciones`;
        });
    }
});

