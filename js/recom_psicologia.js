document.getElementById('recomendacionPsicologiaForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const id_psicologo = parseInt(document.getElementById('id_psicologo').value, 10);
    const id_estudiante = parseInt(document.getElementById('id_estudiante').value, 10);
    const fecha_recomendacion = document.getElementById('fecha_recomendacion').value;
    const recomendacion = document.getElementById('recomendacion').value;

    if (isNaN(id_psicologo) || isNaN(id_estudiante)) {
        document.getElementById('responseMessagePsicologia').innerText = 'ID de psicólogo y estudiante deben ser números enteros';
        return;
    }

    axios.post('http://localhost:3000/registrar_recomendacion_ps', {
        id_psicologo: id_psicologo,
        id_estudiante: id_estudiante,
        fecha_recomendacion: fecha_recomendacion,
        recomendacion: recomendacion
    })
    .then(function (response) {
        document.getElementById('responseMessagePsicologia').innerText = response.data.message;
    })
    .catch(function (error) {
        document.getElementById('responseMessagePsicologia').innerText = 'Error: ' + (error.response ? error.response.data.message : error.message);
    });
});
