let myChart;

const mostrarGraficos = async () => {
    try {
        // Obtener datos para el gráfico de usuarios registrados
        const responseUsers = await axios.get("http://127.0.0.1:3000/getAllUsers");
        
        // Crear un objeto para contar los roles
        const rolesCount = {
            'Administradores': 0,
            'Estudiantes': 0,
            'Enfermeros': 0,
            'Psicólogos': 0
        };

        // Usar un Set para almacenar usuarios únicos
        const uniqueUsers = new Set();
        
        responseUsers.data.forEach(usuarios => {
            let rolLowerCase = usuarios.rol.toLowerCase();
            let userKey = `${usuarios.id}-${rolLowerCase}`; // Crear una clave única basada en el ID y rol

            // Si el usuario no está en el conjunto, agregarlo y contar el rol
            if (!uniqueUsers.has(userKey)) {
                uniqueUsers.add(userKey);
                if (rolLowerCase.includes('admin')) {
                    rolesCount['Administradores']++;
                } else if (rolLowerCase.includes('estudiante')) {
                    rolesCount['Estudiantes']++;
                } else if (rolLowerCase.includes('enfermera')) {
                    rolesCount['Enfermeros']++;
                } else if (rolLowerCase.includes('psicologo')) {
                    rolesCount['Psicólogos']++;
                } else {
                    console.warn(`Rol desconocido: ${usuarios.rol}`);
                }
            }
        });

        // Preparar los datos para el gráfico de usuarios registrados
        console.log('Conteo de roles:', rolesCount); // Verifica el conteo de roles en la consola

        const chartData = {
            labels: Object.keys(rolesCount),
            datasets: [{
                label: 'Tipos de usuarios registrados',
                data: Object.values(rolesCount),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)', // Color para Administradores
                    'rgba(255, 99, 132, 0.2)', // Color para Estudiantes
                    'rgba(75, 192, 192, 0.2)', // Color para Enfermeros
                    'rgba(255, 206, 86, 0.2)'  // Color para Psicólogos
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)', // Color para Administradores
                    'rgba(255, 99, 132, 1)', // Color para Estudiantes
                    'rgba(75, 192, 192, 1)', // Color para Enfermeros
                    'rgba(255, 206, 86, 1)'  // Color para Psicólogos
                ],
                borderWidth: 1
            }]
        };

        const ctxUsers = document.getElementById("myChart").getContext("2d");
        
        if (myChart) {
            myChart.data = chartData;
            myChart.update();
        } else {
            myChart = new Chart(ctxUsers, {
                type: "doughnut",
                data: chartData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: "top",
                        },
                        title: {
                            display: true,
                            text: "Gráfico de Usuarios Registrados"
                        }
                    }
                }
            });
        }

        // Obtener datos para el gráfico combinado de citas de psicología y enfermería
        const responsePsychology = await axios.get("http://127.0.0.1:3000/getcitaspsicologias");
        const totalPsychology = responsePsychology.data.total;

        const responseNursing = await axios.get("http://127.0.0.1:3000/getcitasenfermeria");
        const totalNursing = responseNursing.data.total;

        // Preparar los datos para el gráfico combinado
        const combinedData = {
            labels: ['Citas de Psicología', 'Citas de Enfermería'],
            datasets: [{
                label: 'Cantidad de Citas',
                data: [totalPsychology, totalNursing],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)', // Color para Citas de Psicología
                    'rgba(54, 162, 235, 0.2)'  // Color para Citas de Enfermería
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)', // Color para Citas de Psicología
                    'rgba(54, 162, 235, 1)'  // Color para Citas de Enfermería
                ],
                borderWidth: 1
            }]
        };

        const ctxCombined = document.getElementById("combinedChart").getContext('2d');
        new Chart(ctxCombined, {
            type: 'doughnut',
            data: combinedData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Cantidad de Citas de Psicología y Enfermería'
                    }
                }
            }
        });

    } catch (error) {
        console.error("ERROR AL SOLICITAR LOS DATOS ", error);
        Swal.fire({
            title: "Error con el servidor",
            icon: "error",
            text: "No se pudo cargar una o varias gráficas, intente refrescar la página.",
            toast: true,
            position: "top",
            confirmButtonColor: "#ffc107"
        });
    }
};

// Llamar a la función para mostrar los gráficos al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    mostrarGraficos();
});
