const hostname = window.location.hostname;
const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

const baseFrontend = `${window.location.origin}/FRONTEND/views/`;

export const backend_url = isLocalhost
  ? "http://localhost:3000/"
  : "https://proyectoweb-k36n.onrender.com/";

export const frontend_url = isLocalhost
  ? baseFrontend
  : "https://jpdelmuro.github.io/ProyectoWeb/FRONTEND/views/";

// Validación de sesión
export function validateLogin(redirectTo = "login.html") {
  const user = sessionStorage.getItem("user");
  if (!user || user === 'undefined') {
    alert("Favor de iniciar sesión");
    window.location.href = frontend_url + redirectTo;
  }
}
