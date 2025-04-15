document.addEventListener('DOMContentLoaded', function() {
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    const messageDiv = document.getElementById('message');

    downloadReportBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Evita la navegación del enlace
        
        axios.get('http://127.0.0.1:3000/exportUsers', {
            responseType: 'blob',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'usuarios.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            messageDiv.innerHTML = '<div class="alert alert-success">Reporte descargado exitosamente</div>';
        })
        .catch(function(error) {
            console.error('Error:', error);
            messageDiv.innerHTML = '<div class="alert alert-danger">Error al intentar descargar el reporte</div>';
        });
    });
});
