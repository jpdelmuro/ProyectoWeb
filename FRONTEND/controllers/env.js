const hostname = window.location.hostname;
const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

<<<<<<< HEAD
// Usa la IP base detectada
=======
>>>>>>> 7c6c41e25a609cef1ee65aefda92311cf1266d0e
const baseFrontend = `${window.location.origin}/FRONTEND/views/`;

export const backend_url = isLocalhost
  ? "http://localhost:3000/"
  : "https://proyectoweb-k36n.onrender.com/";

export const frontend_url = isLocalhost
  ? baseFrontend
  : "https://jpdelmuro.github.io/ProyectoWeb/FRONTEND/views/";

// Validar sesión del usuario 
export function validateLogin(redirectTo = "login.html") {
  const user = sessionStorage.getItem("user");
  if (!user) {
    alert("Favor de iniciar sesión");
    window.location.href = frontend_url + redirectTo;
  }
}
