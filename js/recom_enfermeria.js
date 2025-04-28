document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('recomendacionForm');
    const spinner = document.getElementById('loadingSpinner');
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Configuración de Axios
    axios.defaults.baseURL = 'http://localhost:3000';
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.defaults.timeout = 8000; // 8 segundos de timeout

    // Función para mostrar alertas con animación
    function showAlert(message, type = 'success') {
        // Ocultar todas las alertas primero
        if (successAlert) successAlert.style.display = 'none';
        if (errorAlert) errorAlert.style.display = 'none';
        
        if (type === 'success') {
            if (successMessage) successMessage.textContent = message;
            if (successAlert) {
                successAlert.style.display = 'block';
                successAlert.classList.add('animate__fadeIn');
                setTimeout(() => {
                    successAlert.classList.remove('animate__fadeIn');
                }, 1000);
            }
        } else {
            if (errorMessage) errorMessage.textContent = message;
            if (errorAlert) {
                errorAlert.style.display = 'block';
                errorAlert.classList.add('animate__shakeX');
                setTimeout(() => {
                    errorAlert.classList.remove('animate__shakeX');
                }, 1000);
            }
        }
    }

    // Validar que sea número
    function validateNumberInput(input) {
        return !isNaN(input) && Number.isInteger(Number(input));
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Ocultar alertas anteriores
        if (successAlert) successAlert.style.display = 'none';
        if (errorAlert) errorAlert.style.display = 'none';
        
        // Mostrar spinner
        if (spinner) spinner.style.display = 'block';
        
        // Obtener valores del formulario
        const id_enfermero = document.getElementById('id_enfermero').value.trim();
        const id_estudiante = document.getElementById('id_estudiante').value.trim();
        const fecha_recomendacion = document.getElementById('fecha_recomendacion').value;
        const recomendacion = document.getElementById('recomendacion').value.trim();

        // Validaciones
        if (!validateNumberInput(id_enfermero) || !validateNumberInput(id_estudiante)) {
            showAlert('Los documentos deben ser números enteros válidos', 'error');
            if (spinner) spinner.style.display = 'none';
            return;
        }

        if (!fecha_recomendacion || !recomendacion) {
            showAlert('Todos los campos son obligatorios', 'error');
            if (spinner) spinner.style.display = 'none';
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
            
            let errorMsg = 'Error al registrar la recomendación';
            if (error.response) {
                if (error.response.status === 409) {
                    errorMsg = 'Ya existe una recomendación similar para este estudiante';
                } else if (error.response.data && error.response.data.message) {
                    errorMsg = error.response.data.message;
                }
            } else if (error.request) {
                errorMsg = 'No se recibió respuesta del servidor';
            } else {
                errorMsg = error.message;
            }
            
            showAlert(errorMsg, 'error');
        } finally {
            if (spinner) spinner.style.display = 'none';
        }
    });

    // Efecto hover en los botones
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.classList.add('animate__pulse');
        });
        button.addEventListener('mouseleave', function() {
            this.classList.remove('animate__pulse');
        });
    });

    // Efecto de validación en tiempo real para campos numéricos
    const numericFields = ['id_enfermero', 'id_estudiante'];
    numericFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                if (!validateNumberInput(this.value) && this.value !== '') {
                    this.classList.add('is-invalid');
                } else {
                    this.classList.remove('is-invalid');
                }
            });
        }
    });
});