function cerrarSesion() {
    // Elimina toda la información de sessionStorage y localStorage
    sessionStorage.clear();
    localStorage.clear();
  
    // Redirige a la página de login y evita volver atrás
    location.replace("login.html");
  }
  