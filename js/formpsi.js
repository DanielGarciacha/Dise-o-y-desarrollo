document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('PSIFORM');
    
    if (!form) {
        console.error('Error: No se encontró el formulario');
        return;
    }

    // Función mejorada para mostrar mensajes
    function showMessage(message, isError = false) {
        Swal.fire({
            icon: isError ? 'error' : 'success',
            title: isError ? 'Error' : 'Éxito',
            text: message,
            confirmButtonColor: '#6d28d9',
            background: '#ffffff',
            allowOutsideClick: false
        });
    }

    // Elementos del formulario
    const fechaInput = document.getElementById('rc');
    const identificacionInput = document.getElementById('identificacion');
    const horaInput = document.getElementById('hora');
    const sedeSelect = document.getElementById('AR');
    const motivoSelect = document.getElementById('MC');

    // Validación de fecha
    if (fechaInput) {
        fechaInput.addEventListener('change', function () {
            const fechaSeleccionada = new Date(this.value);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (fechaSeleccionada < hoy) {
                showMessage('No puede seleccionar una fecha pasada', true);
                this.value = '';
            }
        });
    }

    // Validación de identificación (solo números)
    if (identificacionInput) {
        identificacionInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    // Manejo del envío del formulario
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) return;

        // Mostrar estado de carga
        submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Procesando...
        `;
        submitBtn.disabled = true;

        // Obtener datos del formulario
        const formData = {
            motivo: motivoSelect.value,
            fecha: fechaInput.value,
            hora: horaInput.value,
            sede: sedeSelect.value,
            identificacion: identificacionInput.value.trim()
        };

        // Validación de campos obligatorios
        if (!formData.motivo || !formData.fecha || !formData.hora || !formData.sede || !formData.identificacion) {
            showMessage('Todos los campos son obligatorios', true);
            submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Guardar Cita';
            submitBtn.disabled = false;
            return;
        }

        try {
            // Enviar datos al servidor
            const response = await axios.post('http://127.0.0.1:3000/citas', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        
            
            if (error.response) {
                // El servidor respondió con un error
                const status = error.response.status;
                const data = error.response.data;
                
                if (status === 409) {
                    showMessage('Ya existe una cita programada en esta sede, fecha y hora', true);
                } else if (data && data.message) {
                    showMessage(data.message, true);
                } else {
                    showMessage(`Error del servidor (${status})`, true);
                }
            } else if (error.request) {
                // La petición fue hecha pero no hubo respuesta
                showMessage('No se recibió respuesta del servidor. Verifica tu conexión.', true);
            } else {
                // Error al configurar la petición
                showMessage('Error al enviar la solicitud: ' + error.message, true);
            }
        } finally {
            // Restaurar el botón
            submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Guardar Cita';
            submitBtn.disabled = false;
        }
    });

    // Función para limpiar el formulario
    window.clearLocalStorage = function() {
        form.reset();
        showMessage('Formulario limpiado correctamente');
    };
});