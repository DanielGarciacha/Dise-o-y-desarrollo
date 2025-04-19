// Conectado con estudiantes2.html(Vanesa)
document.addEventListener('DOMContentLoaded', function(){
    const apiUrl = 'http://127.0.0.1:3000';
    function loadUserList(){
        axios.get(`${apiUrl}/getAll_estu`)
        .then(response => {
            console.log("Datos Recibidos:", response.data);
            const tableBody = document.querySelector('#estudianteVM-table tbody');
            tableBody.innerHTML = '';
            response.data.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                  <td>${user.Nombre_Completo}</td>
                  <td>${user.ID_De_Cita}</td> <!-- Cambiado a ID_De_Cita -->
                  <td>${user.Tipo_Cita}</td>
                  <td>${user.sede}</td>
                  <td>${user.fecha}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching list', error);
        });
    }
    loadUserList();
});

function cerrarSesion() {
    // Limpia cualquier dato de sesión si es necesario
    // Por ejemplo: localStorage.removeItem('sessionToken');

    // Navega a la página de inicio
    window.location.href = '../index.html';

    // Previene la navegación hacia atrás
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function () {
        window.history.pushState(null, '', window.location.href);
    };
}

// Asegúrate de que este código se ejecute cuando la página se cargue
window.addEventListener('load', function() {
    // Previene la navegación hacia atrás
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function () {
        window.history.pushState(null, '', window.location.href);
    };
});