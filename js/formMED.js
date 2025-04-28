// formMED.js modificado
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('ENFERFORM');
    const responseDiv = document.getElementById('response');
    const limpiarBtn = document.querySelector('button[onclick="clearLocalStorage()"]');
    
    function showMessage(message, isError = false) {
        if (isError) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message,
                confirmButtonColor: '#00b09b',
                background: '#fff',
                backdrop: `
                    rgba(0,0,123,0.4)
                    url("/images/nyan-cat.gif")
                    left top
                    no-repeat
                `
            });
        } else {
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: message,
                showConfirmButton: false,
                timer: 2000,
                background: '#fff',
                backdrop: `
                    rgba(0,179,155,0.4)
                    url("/images/nyan-cat.gif")
                    left top
                    no-repeat
                `
            });
        }
        
        responseDiv.innerHTML = `
            <div class="alert alert-${isError ? 'danger' : 'success'} animate__animated animate__fadeIn">
                <strong>${isError ? 'Error:' : 'Éxito:'}</strong> ${message}
            </div>
        `;
        
        setTimeout(() => {
            responseDiv.innerHTML = '';
        }, 5000);
    }

    document.getElementById('rc').addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showMessage('No puede seleccionar una fecha pasada', true);
            this.value = '';
            return;
        }
    });

    document.getElementById('identificacion').addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Procesando...
        `;
        submitBtn.disabled = true;
        
        const formData = {
            motivo: document.getElementById('sintomas').value.trim(),
            fecha: document.getElementById('rc').value,
            hora: document.getElementById('hora').value,
            sede: document.getElementById('AR').value,
            identificacion: document.getElementById('identificacion').value.trim()
        };

        if (!formData.motivo || !formData.fecha || !formData.hora || !formData.sede || !formData.identificacion) {
            showMessage('Todos los campos son obligatorios', true);
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            return;
        }

        if (formData.motivo.length < 10) {
            showMessage('Por favor describa sus síntomas con más detalle', true);
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            return;
        }

        axios.post('http://127.0.0.1:3000/citas_enfermeria', formData)
            .then(response => {
                showMessage('¡Cita registrada exitosamente!');
                form.reset();
                document.getElementById('hora').value = '';
                
                if (response.data.success) {
                    const confettiSettings = {
                        target: 'confetti-canvas',
                        max: 150,
                        size: 1.5,
                        animate: true,
                        props: ['circle', 'square', 'triangle', 'line'],
                        colors: [[255,0,0],[0,255,0],[0,0,255],[255,255,0],[255,0,255],[0,255,255]],
                        clock: 25,
                        rotate: true,
                        start_from_edge: true,
                        respawn: true
                    };
                    const confetti = new ConfettiGenerator(confettiSettings);
                    confetti.render();
                    
                    setTimeout(() => {
                        confetti.clear();
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                let errorMessage = 'Error al registrar la cita';
                
                if (error.response) {
                    if (error.response.status === 409) {
                        errorMessage = 'Ya existe una cita programada en esta sede, fecha y hora';
                        document.getElementById('hora').value = '';
                    } else if (error.response.data && error.response.data.informacion) {
                        errorMessage = error.response.data.informacion;
                    }
                }
                
                showMessage(errorMessage, true);
            })
            .finally(() => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
    });
});