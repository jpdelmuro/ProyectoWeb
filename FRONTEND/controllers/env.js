const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const backend_url = isLocalhost
  ? "http://localhost:3000/"
  : "https://proyectoweb-k36n.onrender.com/";

export const frontend_url = isLocalhost
  ? "http://127.0.0.1:5500/FRONTEND/views/"
  : "https://jpdelmuro.github.io/ProyectoWeb/FRONTEND/views/";


// Validar sesión del usuario 
export function validateLogin(redirectTo = "login.html") {
  const user = sessionStorage.getItem("user");
  if (!user) {
    alert("Favor de iniciar sesión");
    window.location.href = frontend_url + redirectTo;
  }
}
