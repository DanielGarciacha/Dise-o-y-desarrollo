// Conectado con estudiantes.html(Daniel)
document.addEventListener('DOMContentLoaded', function(){
    const apiUrl = 'http://localhost:3000';
    
    function loadUserList(){
        axios.get(`${apiUrl}/getAll_est`)
        .then(response => {
            console.log("Datos Recibidos:", response.data);
            const tableBody = document.querySelector('#estudiantes-table tbody');
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
