document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://localhost:3000';

    function loadRecommendations() {
        axios.get(`${apiUrl}/get_recommendations_est`)
            .then(response => {
                console.log("Datos Recibidos:", response.data);
                const tableBody = document.querySelector('#recomendaciones-table tbody');
                tableBody.innerHTML = '';
                
                // Ordenar las recomendaciones por ID_De_Recomendacion de menor a mayor (ascendente)
                const sortedRecommendations = response.data.sort((a, b) => {
                    // Convertir a números para asegurar orden numérico
                    const idA = parseInt(a.ID_De_Recomendacion);
                    const idB = parseInt(b.ID_De_Recomendacion);
                    return idA - idB; // Orden ascendente (cambiado de idB - idA a idA - idB)
                });

                sortedRecommendations.forEach(recommendation => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${recommendation.Tipo_Recomendacion || 'N/A'}</td>
                        <td>${recommendation.ID_De_Recomendacion || 'N/A'}</td>
                        <td>${recommendation.recomendacion || 'Sin descripción'}</td>
                        <td>${recommendation.fecha || 'No especificada'}</td>
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error al cargar recomendaciones:', error);
                
                // Mostrar mensaje de error en la tabla
                const tableBody = document.querySelector('#recomendaciones-table tbody');
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; color: red;">
                            Error al cargar recomendaciones. Intente nuevamente.
                        </td>
                    </tr>
                `;
            });
    }

    loadRecommendations();

    // Opcional: Actualizar cada 5 minutos
    setInterval(loadRecommendations, 300000);
});