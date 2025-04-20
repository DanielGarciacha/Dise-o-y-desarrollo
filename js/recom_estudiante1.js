document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://127.0.0.1:3000';

    function loadRecommendations() {
        axios.get(`${apiUrl}/get_recommendations_est`)
            .then(response => {
                console.log("Datos Recibidos:", response.data);
                const tableBody = document.querySelector('#recomendaciones-table tbody');
                tableBody.innerHTML = '';
                response.data.forEach(recommendation => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${recommendation.Tipo_Recomendacion}</td>
                        <td>${recommendation.ID_De_Recomendacion}</td>
                        <td>${recommendation.recomendacion}</td>
                        <td>${recommendation.fecha}</td>
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching recommendations:', error);
            });
    }

    loadRecommendations();
});
