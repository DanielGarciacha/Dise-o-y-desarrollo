document.getElementById('recomendacionForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const id_enfermero = parseInt(document.getElementById('id_enfermero').value, 10);
    const id_estudiante = parseInt(document.getElementById('id_estudiante').value, 10);
    const fecha_recomendacion = document.getElementById('fecha_recomendacion').value;
    const recomendacion = document.getElementById('recomendacion').value;

    if (isNaN(id_enfermero) || isNaN(id_estudiante)) {
        document.getElementById('responseMessage').innerText = 'ID de enfermero y estudiante deben ser números enteros';
        return;
    }

    axios.post('http://localhost:3000/registrar_recomendacion_ef', {
        id_enfermero: id_enfermero,
        id_estudiante: id_estudiante,
        fecha_recomendacion: fecha_recomendacion,
        recomendacion: recomendacion
    })
    .then(function (response) {
        document.getElementById('responseMessage').innerText = response.data.message;
    })
    .catch(function (error) {
        document.getElementById('responseMessage').innerText = 'Error: ' + (error.response ? error.response.data.message : error.message);
    });
});
