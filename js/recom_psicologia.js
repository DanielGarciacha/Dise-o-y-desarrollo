document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("recomendacionPsicologiaForm");
    const spinner = document.getElementById("loadingSpinner");
    const successAlert = document.getElementById("successAlert");
    const errorAlert = document.getElementById("errorAlert");
    const successMessage = document.getElementById("successMessage");
    const errorMessage = document.getElementById("errorMessage");

    // Configuración de Axios
    axios.defaults.baseURL = "http://localhost:3000";
    axios.defaults.headers.post["Content-Type"] = "application/json";
    axios.defaults.timeout = 8000;

    // Función para mostrar alertas con animación
    function showAlert(message, type = "success") {
        successAlert.style.display = "none";
        errorAlert.style.display = "none";
        
        if (type === "success") {
            successMessage.textContent = message;
            successAlert.style.display = "block";
            successAlert.classList.add("animate__fadeIn");
            setTimeout(() => {
                successAlert.classList.remove("animate__fadeIn");
            }, 1000);
        } else {
            errorMessage.textContent = message;
            errorAlert.style.display = "block";
            errorAlert.classList.add("animate__shakeX");
            setTimeout(() => {
                errorAlert.classList.remove("animate__shakeX");
            }, 1000);
        }
    }

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        // Mostrar spinner
        spinner.style.display = "block";
        
        // Ocultar alertas anteriores
        successAlert.style.display = "none";
        errorAlert.style.display = "none";

        const id_psicologo = parseInt(document.getElementById('id_psicologo').value, 10);
        const id_estudiante = parseInt(document.getElementById('id_estudiante').value, 10);
        const fecha_recomendacion = document.getElementById('fecha_recomendacion').value;
        const recomendacion = document.getElementById('recomendacion').value;

        if (isNaN(id_psicologo) || isNaN(id_estudiante)) {
            showAlert('ID de psicólogo y estudiante deben ser números enteros', 'error');
            spinner.style.display = "none";
            return;
        }

        if (!fecha_recomendacion || !recomendacion) {
            showAlert("Todos los campos son obligatorios", "error");
            spinner.style.display = "none";
            return;
        }

        axios.post('/registrar_recomendacion_ps', {
            id_psicologo: id_psicologo,
            id_estudiante: id_estudiante,
            fecha_recomendacion: fecha_recomendacion,
            recomendacion: recomendacion
        })
        .then(function (response) {
            showAlert(response.data.message || "Recomendación registrada exitosamente");
            form.reset();
        })
        .catch(function (error) {
            console.error("Error al enviar recomendación:", error);
            
            let errorMsg = "Error al registrar la recomendación";
            if (error.response) {
                if (error.response.status === 409) {
                    errorMsg = "Ya existe una recomendación similar para este estudiante";
                } else if (error.response.data && error.response.data.message) {
                    errorMsg = error.response.data.message;
                }
            } else if (error.request) {
                errorMsg = "No se recibió respuesta del servidor";
            }
            
            showAlert(errorMsg, "error");
        })
        .finally(function() {
            spinner.style.display = "none";
        });
    });

    // Efecto hover en los botones
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach(button => {
        button.addEventListener("mouseenter", function() {
            this.classList.add("pulse");
        });
        button.addEventListener("mouseleave", function() {
            this.classList.remove("pulse");
        });
    });
});