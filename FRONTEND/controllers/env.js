
export const local_url = "https://proyectoweb-k36n.onrender.com/";

// Validar sesión del usuario 
export function validateLogin(redirectTo = "login.html") {
  const user = sessionStorage.getItem("user");
  if (!user) {
    alert("Favor de iniciar sesión");
    window.location.href = redirectTo;
  }
}
