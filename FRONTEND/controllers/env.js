
// URL del backend en Render
export const backend_url = "https://proyectoweb-k36n.onrender.com/";

// URL del frontend en GitHub Pages
export const frontend_url = "https://jpdelmuro.github.io/ProyectoWeb/FRONTEND/views/";

// Validar sesión del usuario 
export function validateLogin(redirectTo = "login.html") {
  const user = sessionStorage.getItem("user");
  if (!user) {
    alert("Favor de iniciar sesión");
    window.location.href = redirectTo;
  }
}
