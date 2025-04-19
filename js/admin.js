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

    // Función para mostrar notificaciones mejorada y más llamativa
    function showAlert(message, type) {
        // Determinar iconos y colores según el tipo de alerta
        let icon, backgroundColor, borderColor;
        
        switch(type) {
            case 'success':
                icon = '✅';
                backgroundColor = '#28a745';
                borderColor = '#218838';
                break;
            case 'error':
                icon = '❌';
                backgroundColor = '#dc3545';
                borderColor = '#c82333';
                break;
            case 'warning':
                icon = '⚠️';
                backgroundColor = '#ffc107';
                borderColor = '#e0a800';
                break;
            default:
                icon = 'ℹ️';
                backgroundColor = '#17a2b8';
                borderColor = '#138496';
        }
        
        const alertDiv = document.createElement('div');
        alertDiv.innerHTML = `<span style="font-size: 1.2em; margin-right: 10px;">${icon}</span> ${message}`;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.padding = '15px 25px';
        alertDiv.style.backgroundColor = backgroundColor;
        alertDiv.style.color = 'white';
        alertDiv.style.fontWeight = 'bold';
        alertDiv.style.borderRadius = '8px';
        alertDiv.style.borderLeft = `5px solid ${borderColor}`;
        alertDiv.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.4)';
        alertDiv.style.zIndex = '1050';
        alertDiv.style.minWidth = '300px';
        alertDiv.style.transition = 'all 0.3s ease-in-out';
        alertDiv.style.animation = 'fadeInRight 0.5s forwards';
        
        // Agregar un botón para cerrar la alerta
        const closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '5px';
        closeButton.style.right = '10px';
        closeButton.style.fontSize = '1.5em';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => alertDiv.remove();
        
        alertDiv.appendChild(closeButton);
        document.body.appendChild(alertDiv);
        
        // Añadir una animación CSS
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            @keyframes fadeInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(styleElement);
        
        // Eliminar automáticamente después de 5 segundos
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            alertDiv.style.transform = 'translateX(100px)';
            setTimeout(() => {
                alertDiv.remove();
                styleElement.remove();
            }, 500);
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
                // Redirigir a la lista de usuarios después de actualizar
                document.querySelector('[data-tab="userList"]').click();
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

    // Editar un usuario - Mejorado para activar la pestaña de edición
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
                    
                    // Activar la pestaña de actualización
                    const updateTab = document.querySelector('[data-tab="updateUser"]');
                    if (updateTab) {
                        // Primero simulamos un clic en la pestaña
                        updateTab.click();
                        
                        // Luego nos aseguramos de que el elemento esté visible
                        const updateSection = document.getElementById('updateUser');
                        if (updateSection) {
                            // Hacer visible la sección
                            updateSection.style.display = 'block';
                            
                            // Marcar la pestaña como activa
                            document.querySelectorAll('.nav-link').forEach(tab => {
                                tab.classList.remove('active');
                            });
                            updateTab.classList.add('active');
                            
                            // Desactivar otras secciones
                            document.querySelectorAll('.tab-pane').forEach(pane => {
                                pane.style.display = 'none';
                            });
                            
                            // Hacer scroll suave a la sección
                            updateSection.scrollIntoView({ behavior: 'smooth' });
                            
                            // Destacar visualmente el formulario
                            const updateForm = document.getElementById('updateForm');
                            if (updateForm) {
                                updateForm.style.animation = 'highlight 1.5s ease-in-out';
                                // Añadir estilo de animación
                                const styleElement = document.createElement('style');
                                styleElement.textContent = `
                                    @keyframes highlight {
                                        0% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); }
                                        50% { box-shadow: 0 0 15px 5px rgba(0, 123, 255, 0.5); }
                                        100% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); }
                                    }
                                `;
                                document.head.appendChild(styleElement);
                                
                                // Eliminar el estilo después de la animación
                                setTimeout(() => {
                                    styleElement.remove();
                                    updateForm.style.animation = '';
                                }, 1500);
                            }
                        }
                    }
                    
                    showAlert(`Editando usuario: ${user.nombre}`, 'info');
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

// Unificar la funcionalidad de descarga en una sola función
document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'http://localhost:3000';

    // ✅ Alerta visual destacada tipo toast mejorada
    function showDownloadAlert(mensaje, tipo = 'success') {
        // Determinar iconos según el tipo
        let icon;
        switch(tipo) {
            case 'success':
                icon = '📥';
                break;
            case 'warning':
                icon = '⚠️';
                break;
            case 'error':
                icon = '❌';
                break;
            default:
                icon = 'ℹ️';
        }
        
        const alertDiv = document.createElement('div');
        alertDiv.innerHTML = `<span style="font-size: 1.5em; margin-right: 10px;">${icon}</span> ${mensaje}`;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.padding = '18px 25px';
        alertDiv.style.backgroundColor = '#28a745';
        alertDiv.style.color = 'white';
        alertDiv.style.fontWeight = 'bold';
        alertDiv.style.borderRadius = '10px';
        alertDiv.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.4)';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.transition = 'all 0.4s ease';
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-20px)';
        alertDiv.style.width = '350px';
        alertDiv.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        alertDiv.style.backdropFilter = 'blur(5px)';
        alertDiv.style.fontSize = '16px';
        alertDiv.style.textAlign = 'center';
        
        document.body.appendChild(alertDiv);
        
        // Aplicar transición para que aparezca
        setTimeout(() => {
            alertDiv.style.opacity = '1';
            alertDiv.style.transform = 'translateY(0)';
        }, 10);
        
        // Agregar un efecto de pulso
        const pulseAnimation = document.createElement('style');
        pulseAnimation.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.03); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(pulseAnimation);
        alertDiv.style.animation = 'pulse 1s infinite';

        setTimeout(() => {
            alertDiv.style.opacity = '0';
            alertDiv.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                alertDiv.remove();
                pulseAnimation.remove();
            }, 500);
        }, 4000);
    }

    // 📥 Botón para reporte de citas
    const btnDescargarCitas = document.getElementById("downloadCitasBtn");
    if (btnDescargarCitas) {
        btnDescargarCitas.addEventListener("click", function (e) {
            e.preventDefault();
            showDownloadAlert("Descargando reporte de todas las citas...");
            window.location.href = `${apiUrl}/exportar_reporte_citas`;
        });
    }

    // 📥 Botón para reporte de recomendaciones
    const btnDescargarRecs = document.getElementById("downloadRecsBtn");
    if (btnDescargarRecs) {
        btnDescargarRecs.addEventListener("click", function (e) {
            e.preventDefault();
            showDownloadAlert("Descargando reporte de recomendaciones...");
            window.location.href = `${apiUrl}/exportar_reporte_recomendaciones`;
        });
    }
});