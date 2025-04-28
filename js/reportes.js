document.addEventListener('DOMContentLoaded', function() {
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Evita la navegación del enlace
            
            // Mostrar alerta de descarga iniciada
            showAlert('Descargando reporte de usuarios', 'success');
            
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
                
                // Mostrar alerta de éxito
                showAlert('Reporte de usuarios descargado exitosamente', 'success');
            })
            .catch(function(error) {
                console.error('Error:', error);
                // Mostrar alerta de error
                showAlert('Error al intentar descargar el reporte de usuarios', 'error');
            });
        });
    }

    // Función para mostrar alertas personalizadas (asegúrate de que esta función esté disponible)
    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `custom-alert ${type}`;
        alertDiv.innerHTML = `
            <div class="alert-content">
                <span class="alert-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : '!'}</span>
                <span class="alert-message">${message}</span>
                <span class="alert-close">&times;</span>
            </div>
        `;
        document.body.appendChild(alertDiv);
        // Estilos dinámicos
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.padding = '15px 25px';
        alertDiv.style.backgroundColor = type === 'success' ? '#4CAF50' : 
                                          type === 'error' ? '#F44336' : '#2196F3';
        alertDiv.style.color = 'white';
        alertDiv.style.borderRadius = '4px';
        alertDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.animation = 'slideIn 0.3s forwards';
        // Cerrar alerta manualmente
        alertDiv.querySelector('.alert-close').addEventListener('click', () => {
            alertDiv.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => alertDiv.remove(), 300);
        });
        // Auto cerrar en 5 segundos
        setTimeout(() => {
            alertDiv.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => alertDiv.remove(), 300);
        }, 5000);
    }
});

// Estilos de animación (solo añádelos si no están ya definidos en otro lugar)
if (!document.querySelector('style#alert-animations')) {
    const style = document.createElement('style');
    style.id = 'alert-animations';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .custom-alert {
            font-family: Arial, sans-serif;
            min-width: 300px;
            max-width: 400px;
            transition: all 0.3s ease;
        }
        .alert-content {
            display: flex;
            align-items: center;
        }
        .alert-icon {
            margin-right: 10px;
            font-size: 1.2em;
        }
        .alert-close {
            margin-left: auto;
            cursor: pointer;
            font-size: 1.5em;
        }
    `;
    document.head.appendChild(style);
}