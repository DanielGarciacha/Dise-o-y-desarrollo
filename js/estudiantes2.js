// Conectado con estudiantes2.html(Vanesa)
document.addEventListener('DOMContentLoaded', function(){
    const apiUrl = 'http://localhost:3000';
    
    function loadUserList(){
        axios.get(`${apiUrl}/getAll_estu`)
        .then(response => {
            console.log("Datos Recibidos:", response.data);
            const tableBody = document.querySelector('#estudianteVM-table tbody');
            tableBody.innerHTML = '';
            
            // Ordenar por ID_De_Cita numéricamente
            const sortedData = response.data.sort((a, b) => {
                return parseInt(a.ID_De_Cita) - parseInt(b.ID_De_Cita);
            });
            
            sortedData.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                  <td>${user.Nombre_Completo}</td>
                  <td>${user.ID_De_Cita}</td>
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
    localStorage.removeItem('sessionToken');

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