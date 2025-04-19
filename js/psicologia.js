document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://127.0.0.1:3000';

    // Inicializar DataTables
    const table = $('#dataTable').DataTable({
        "ajax": {
            "url": `${apiUrl}/getAll_psi`,
            "dataSrc": ""
        },
        "columns": [
            { "data": "nombre_apellidos", "title": "Nombre Completo" },
            { "data": "correo", "title": "Correo" },
            { "data": "genero", "title": "Género" },
            { "data": "motivo", "title": "Motivo" },
            { "data": "fecha_reserva", "title": "Fecha" },
            { "data": "hora_reserva", "title": "Hora" },
            { "data": "sede", "title": "Sede" },
            { "data": "user_id", "title": "ID Usuario" },
            { 
                "data": null,
                "title": "Acciones",
                "className": "text-center",
                "orderable": false,
                "render": function(data, type, row) {
                    return `
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${row.id}">
                            <i class="fas fa-trash-alt"></i> Eliminar
                        </button>
                    `;
                }
            }
        ],
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json"
        },
        "responsive": true
    });

    // Manejar evento de eliminación
    $('#dataTable').on('click', '.delete-btn', function() {
        const citaId = $(this).data('id');
        if (confirm('¿Está seguro de eliminar esta cita psicológica?')) {
            axios.delete(`${apiUrl}/delete_psi/${citaId}`)
                .then(response => {
                    if (response.data.success) {
                        alert('Cita eliminada correctamente');
                        table.ajax.reload(null, false);
                    } else {
                        throw new Error(response.data.message || 'Error al eliminar');
                    }
                })
                .catch(error => {
                    console.error('Error al eliminar:', error);
                    alert('Error al eliminar la cita: ' + (error.response?.data?.message || error.message));
                });
        }
    });
});