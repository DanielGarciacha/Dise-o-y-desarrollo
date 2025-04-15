document.addEventListener('DOMContentLoaded', function(){
    const apiUrl = 'http://127.0.0.1:3000';

    // Inicializar la tabla como un DataTable
    const table = $('#dataTable').DataTable({
        "paging": true,
        "searching": true,
        "ordering": true,
        "info": true,
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json"
        },
        "responsive": true,
        "dom": '<"top"lf>rt<"bottom"ip>',
        "columnDefs": [
            { "className": "text-center", "targets": [8] }
        ]
    });

    // Función para cargar la lista de usuarios
    function loadUserList() {
        axios.get(`${apiUrl}/getAll_enfer`)
            .then(response => {
                console.log("Datos recibidos:", response.data);
                table.clear();
                response.data.forEach(user => {
                    table.row.add([
                        user.nombre_apellidos,
                        user.correo,
                        user.genero,
                        user.motivo,
                        user.fecha_reserva,
                        user.hora_reserva,
                        user.sede,
                        user.user_id,  // Cambiado de user.id a user.user_id para coincidir con psicología
                        `
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${user.id}">
                            <i class="fas fa-trash-alt"></i> Eliminar
                        </button>`
                    ]).draw(false);
                });
            })
            .catch(error => {
                console.error('Error fetching user list:', error);
                alert('Error al cargar la lista de citas');
            });
    }

    // Manejar clic en botones de eliminar (delegación de eventos)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const button = e.target.classList.contains('delete-btn') ? e.target : e.target.closest('.delete-btn');
            const citaId = button.getAttribute('data-id');
            deleteUser(citaId);
        }
    });

    // Función para eliminar un usuario
    window.deleteUser = function(citaId) {
        if (confirm('¿Está seguro que desea eliminar esta cita?')) {
            axios.delete(`${apiUrl}/delete_enfer/${citaId}`)
                .then(response => {
                    if (response.data.success) {
                        alert('Cita eliminada correctamente');
                        loadUserList();
                    } else {
                        throw new Error(response.data.message || 'Error al eliminar la cita');
                    }
                })
                .catch(error => {
                    console.error('Error deleting appointment:', error);
                    alert(error.message || 'Error al eliminar la cita. Por favor intente nuevamente.');
                });
        }
    }

    // Cargar lista inicial
    loadUserList();
});