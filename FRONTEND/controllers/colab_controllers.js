import { backend_url, frontend_url } from '../controllers/env.js';

document.addEventListener("DOMContentLoaded", () => {
  const rawUser = sessionStorage.getItem("user");
  if (!rawUser) {
    alert("Favor de iniciar sesión.");
    window.location.href = frontend_url + "login.html";
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(rawUser);
  } catch (err) {
    sessionStorage.clear();
    window.location.href = frontend_url + "login.html";
    return;
  }

  const user = parsed.user;
  const token = parsed.token;

  if (!user || !user._id) {
    sessionStorage.clear();
    window.location.href = frontend_url + "login.html";
    return;
  }

  let emailColaborador = "";

  // Mostrar modal de confirmación
  window.mostrarModal = (event) => {
    event.preventDefault();
    emailColaborador = document.getElementById("email").value.trim();
    if (!emailColaborador) return;

    document.getElementById("emailDestino").textContent = emailColaborador;

    const modal = new bootstrap.Modal(document.getElementById("confirmModal"));
    modal.show();
  };

  // Confirmar e invitar
  window.confirmarInvitacion = async () => {
    try {
      const res = await fetch(`${backend_url}api/users/${user._id}/colaboradores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization puede agregarse si implementas middleware de autenticación
        },
        body: JSON.stringify({ correoColaborador: emailColaborador })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "No se pudo agregar colaborador");

      alert("Colaborador agregado con éxito.");
      document.getElementById("email").value = "";

      const modalEl = document.getElementById("confirmModal");
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
    } catch (err) {
      alert(err.message);
    }
  };
});
