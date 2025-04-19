document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('recomendacionPsicologiaForm');
    
    if (!form) {
        console.error('Formulario no encontrado');
        return;
    }

    // Configuración de Axios
    axios.defaults.baseURL = 'http://localhost:3000';
    axios.defaults.headers.post['Content-Type'] = 'application/json';

    // Función para mostrar alertas en modal (similar a enfermería)
    function showAlert(message, type = 'success') {
        // Crear modal si no existe
        let modal = document.getElementById('alertModalPsicologia');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'alertModalPsicologia';
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

        // Mostrar el modal con animación
        $(modal).modal('show').addClass('animate__animated animate__fadeIn');
        
        // Eliminar el modal después de cerrarse (opcional)
        $(modal).on('hidden.bs.modal', function() {
            $(this).removeClass('animate__animated animate__fadeIn');
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
        const id_psicologo = document.getElementById('id_psicologo').value.trim();
        const id_estudiante = document.getElementById('id_estudiante').value.trim();
        const fecha_recomendacion = document.getElementById('fecha_recomendacion').value;
        const recomendacion = document.getElementById('recomendacion').value.trim();

        // Validaciones
        if (!validateNumberInput(id_psicologo) || !validateNumberInput(id_estudiante)) {
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
            const response = await axios.post('/registrar_recomendacion_ps', {
                id_psicologo: parseInt(id_psicologo),
                id_estudiante: parseInt(id_estudiante),
                fecha_recomendacion: fecha_recomendacion,
                recomendacion: recomendacion
            });

            // Mostrar éxito y resetear formulario
            showAlert(response.data.message || 'Recomendación psicológica registrada exitosamente');
            form.reset();
            
        } catch (error) {
            console.error('Error al enviar recomendación:', error);
            
            let errorMessage = 'Error al registrar la recomendación psicológica';
            if (error.response) {
                if (error.response.status === 409) {
                    errorMessage = 'Ya existe una recomendación psicológica similar';
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