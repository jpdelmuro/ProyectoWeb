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

  // Capturar envío del formulario
  const form = document.getElementById("formColaborador");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      emailColaborador = document.getElementById("email").value.trim();
      if (!emailColaborador) {
        alert("Ingresa un correo válido.");
        return;
      }

      document.getElementById("emailDestino").textContent = emailColaborador;
      const modal = new bootstrap.Modal(document.getElementById("confirmModal"));
      modal.show();
    });
  }

  // Confirmar invitación
  const btnConfirmar = document.getElementById("btnConfirmar");
  if (!btnConfirmar) {
    console.error("No se encontró el botón con ID 'btnConfirmar'");
  } else {
    btnConfirmar.addEventListener("click", async () => {
      try {
        const res = await fetch(`${backend_url}api/users/${user._id}/colaboradores`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ correoColaborador: emailColaborador })
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "No se pudo agregar colaborador");

        alert("Colaborador agregado con éxito.");
        document.getElementById("email").value = "";

        const modalEl = document.getElementById("confirmModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

      } catch (err) {
        alert(err.message);
      }
    });
  }
});
