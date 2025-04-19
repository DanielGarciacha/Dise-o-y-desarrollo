document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('recomendacionForm');
    
    if (!form) {
        console.error('Formulario no encontrado');
        return;
    }

    // Configuración de Axios
    axios.defaults.baseURL = 'http://localhost:3000';
    axios.defaults.headers.post['Content-Type'] = 'application/json';

    // Función para mostrar alertas en modal
    function showAlert(message, type = 'success') {
        // Crear modal si no existe
        let modal = document.getElementById('alertModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'alertModal';
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header ${type === 'success' ? 'bg-success' : 'bg-danger'} text-white">
                            <h5 class="modal-title">${type === 'success' ? 'Éxito' : 'Error'}</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            ${message}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        } else {
            // Actualizar contenido del modal existente
            const header = modal.querySelector('.modal-header');
            header.className = `modal-header ${type === 'success' ? 'bg-success' : 'bg-danger'} text-white`;
            modal.querySelector('.modal-title').textContent = type === 'success' ? 'Éxito' : 'Error';
            modal.querySelector('.modal-body').innerHTML = message;
        }

        // Mostrar el modal
        $(modal).modal('show');
        
        // Eliminar el modal después de cerrarse (opcional)
        $(modal).on('hidden.bs.modal', function() {
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 500);
        });
    }

    // Validar que sea número
    function validateNumberInput(input) {
        return !isNaN(input) && Number.isInteger(Number(input));
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Mostrar spinner de carga
        const spinner = document.getElementById('loadingSpinner');
        spinner.style.display = 'block';
        
        // Obtener valores del formulario
        const id_enfermero = document.getElementById('id_enfermero').value.trim();
        const id_estudiante = document.getElementById('id_estudiante').value.trim();
        const fecha_recomendacion = document.getElementById('fecha_recomendacion').value;
        const recomendacion = document.getElementById('recomendacion').value.trim();

        // Validaciones
        if (!validateNumberInput(id_enfermero) || !validateNumberInput(id_estudiante)) {
            showAlert('Los IDs deben ser números enteros', 'error');
            spinner.style.display = 'none';
            return;
        }

        if (!fecha_recomendacion || !recomendacion) {
            showAlert('Todos los campos son obligatorios', 'error');
            spinner.style.display = 'none';
            return;
        }

        try {
            // Enviar datos al backend
            const response = await axios.post('/registrar_recomendacion_ef', {
                id_enfermero: parseInt(id_enfermero),
                id_estudiante: parseInt(id_estudiante),
                fecha_recomendacion: fecha_recomendacion,
                recomendacion: recomendacion
            });

            // Mostrar éxito y resetear formulario
            showAlert(response.data.message || 'Recomendación registrada exitosamente');
            form.reset();
            
        } catch (error) {
            console.error('Error al enviar recomendación:', error);
            
            let errorMessage = 'Error al registrar la recomendación';
            if (error.response) {
                if (error.response.status === 409) {
                    errorMessage = 'Ya existe una recomendación similar';
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            }
            
            showAlert(errorMessage, 'error');
        } finally {
            spinner.style.display = 'none';
        }
    });
});