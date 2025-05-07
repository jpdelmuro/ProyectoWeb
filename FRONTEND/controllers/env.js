// Detectar si estamos en desarrollo local o en producción
const isLocalhost = window.location.hostname === "localhost";

// Backend local o Render
export const backend_url = isLocalhost
  ? "http://localhost:3000/"
  : "https://proyectoweb-k36n.onrender.com/";

// Frontend local o GitHub Pages
export const frontend_url = isLocalhost
  ? "http://localhost:5500/FRONTEND/views/" // cambia el puerto si usas otro
  : "https://jpdelmuro.github.io/ProyectoWeb/FRONTEND/views/";

// Validar sesión del usuario 
export function validateLogin(redirectTo = "login.html") {
  const user = sessionStorage.getItem("user");
  if (!user) {
    alert("Favor de iniciar sesión");
    window.location.href = redirectTo;
  }
}
