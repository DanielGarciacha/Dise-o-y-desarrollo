document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('PSIFORM');
    const fechaInput = document.getElementById('rc');
    const sedeInput = document.getElementById('AR');
    const horaSelect = document.getElementById('hora');
    
    // Crear un div para mensajes de alerta si no existe
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.style.padding = '10px';
        alertContainer.style.margin = '10px 0';
        alertContainer.style.borderRadius = '5px';
        alertContainer.style.fontWeight = 'bold';
        alertContainer.style.textAlign = 'center';
        alertContainer.style.display = 'none';
        // Insertar antes del formulario
        form.parentNode.insertBefore(alertContainer, form);
    }
    
    // Función para mostrar mensaje de alerta
    function mostrarAlerta(mensaje, tipo) {
        alertContainer.textContent = mensaje;
        alertContainer.style.display = 'block';
        
        // Establecer colores según el tipo de mensaje
        if (tipo === 'error') {
            alertContainer.style.backgroundColor = '#ffcccc';
            alertContainer.style.color = '#cc0000';
            alertContainer.style.border = '2px solid #cc0000';
        } else if (tipo === 'success') {
            alertContainer.style.backgroundColor = '#ccffcc';
            alertContainer.style.color = '#006600';
            alertContainer.style.border = '2px solid #006600';
        } else if (tipo === 'warning') {
            alertContainer.style.backgroundColor = '#ffffcc';
            alertContainer.style.color = '#cc6600';
            alertContainer.style.border = '2px solid #cc6600';
        }
        
        // Hacer que el mensaje desaparezca después de 5 segundos
        setTimeout(() => {
            alertContainer.style.display = 'none';
        }, 5000);
    }
    
    // Función para actualizar las horas disponibles
    function actualizarHorasDisponibles() {
        const fecha = fechaInput.value;
        const sede = sedeInput.value;
        
        if (!fecha || !sede) return;
        
        // Mostrar indicador de carga
        horaSelect.innerHTML = '<option value="">Cargando horarios...</option>';
        
        axios.get(`http://127.0.0.1:3000/disponibilidad?fecha=${fecha}&sede=${sede}`)
            .then(response => {
                const horasDisponibles = response.data.horas_disponibles;
                
                // Actualizar las opciones del selector de horas
                horaSelect.innerHTML = '<option value="">Seleccione una hora</option>';
                
                if (horasDisponibles.length === 0) {
                    horaSelect.innerHTML += '<option value="" disabled>No hay horarios disponibles</option>';
                    mostrarAlerta('No hay horarios disponibles para esta fecha y sede', 'warning');
                } else {
                    horasDisponibles.forEach(hora => {
                        horaSelect.innerHTML += `<option value="${hora}">${hora}</option>`;
                    });
                }
            })
            .catch(error => {
                console.error('Error al obtener horarios:', error);
                horaSelect.innerHTML = '<option value="">Error al cargar horarios</option>';
                mostrarAlerta('Error al cargar los horarios disponibles', 'error');
            });
    }
    
    // Actualizar horarios cuando cambie la fecha o sede
    fechaInput.addEventListener('change', actualizarHorasDisponibles);
    sedeInput.addEventListener('change', actualizarHorasDisponibles);
    
    // El resto de tu código del formulario
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const motivo = document.getElementById('MC').value;
        const fecha = fechaInput.value;
        const hora = horaSelect.value;
        const sede = sedeInput.value;
        const identificacion = document.getElementById('identificacion').value;

        if (!motivo || !fecha || !hora || !sede || !identificacion) {
            mostrarAlerta("Todos los campos son necesarios", 'error');
            return;
        }

        console.log('Datos a enviar:', {
            motivo: motivo,
            fecha: fecha,
            hora: hora,
            sede: sede,
            identificacion: identificacion
        });

        axios.post('http://127.0.0.1:3000/citas', {
            motivo: motivo,
            fecha: fecha,
            hora: hora,
            sede: sede,
            identificacion: identificacion
        })
        .then(response => {
            mostrarAlerta(response.data.informacion, 'success');
            form.reset();
            // Actualizar los horarios disponibles después de registrar la cita
            setTimeout(() => {
                fechaInput.value = '';
                sedeInput.value = '';
                horaSelect.innerHTML = '<option value="">Seleccione una hora</option>';
            }, 500);
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
            let errorMessage = "Error al guardar los datos";

            if (error.response && error.response.data && error.response.data.informacion) {
                errorMessage = error.response.data.informacion;
            } else if (error.message) {
                errorMessage = error.message;
            }

            mostrarAlerta(errorMessage, 'error');
        });
    });
    
    // Inicializar la página cargando las horas disponibles si ya hay valores seleccionados
    if (fechaInput.value && sedeInput.value) {
        actualizarHorasDisponibles();
    }
}); 