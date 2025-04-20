 document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('PSIFORM');  // Problema de variables, dos documentos html tenian el mismo nombre como ID
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const nombre = document.getElementById('username').value;
        const email = document.getElementById('emailInput').value;
        const gender = document.getElementById('Gender').value;
        const motivo = document.getElementById('MC').value;
        const fecha = document.getElementById('rc').value;
        const sede = document.getElementById('AR').value;
        const user_id = document.getElementById('user_id').value;

        if (!nombre || !email || !gender || !motivo || !fecha || !sede || !user_id) {
            document.getElementById('response').innerText = "Todos los campos son necesarios";
            return;
        }

        console.log('Datos a enviar:', {
            nombre: nombre,
            email: email,
            genero: gender,
            motivo: motivo,
            fecha: fecha,
            sede: sede,
            user_id: user_id
        });

        axios.post('http://127.0.0.1:3000/add_psicologo', {
            nombre: nombre,
            email: email,
            genero: gender,
            motivo: motivo,
            fecha: fecha,
            sede: sede,
            user_id: user_id
        })
        .then(response => {
            document.getElementById('response').innerText = response.data.informacion;
            form.reset();
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
            let errorMessage = "Error al guardar los datos";
        
            if (error.response && error.response.data && error.response.data.informacion) {
                errorMessage = error.response.data.informacion;
            } else if (error.message) {
                errorMessage = error.message;
            }
        
            document.getElementById('response').innerText = errorMessage;
        });
        
    });
});
