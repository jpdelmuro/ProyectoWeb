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


  async function cargarColaboradores() {
    try {
      const res = await fetch(`${backend_url}api/users/${user._id}/colaboradores`);
      const colaboradores = await res.json();

      const lista = document.getElementById("listaColaboradores");
      if (!lista) return;

      lista.innerHTML = "";

      if (!Array.isArray(colaboradores) || colaboradores.length === 0) {
        lista.innerHTML = "<li class='list-group-item'>No tienes colaboradores aún.</li>";
        return;
      }

      colaboradores.forEach(col => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = `${col.nombre} (${col.correo})`;
        lista.appendChild(li);
      });
    } catch (err) {
      console.error("Error al cargar colaboradores:", err);
    }
  }

  async function cargarSolicitudesPendientes() {
    try {
      const res = await fetch(`${backend_url}api/users/${user._id}`);
      const userData = await res.json();
  
      const lista = document.getElementById("solicitudesPendientes");
      if (!lista) return;
  
      lista.innerHTML = "";
  
      if (!userData.solicitudesPendientes || userData.solicitudesPendientes.length === 0) {
        lista.innerHTML = "<li class='list-group-item'>No tienes solicitudes pendientes.</li>";
        return;
      }
  
      for (const id of userData.solicitudesPendientes) {
        // Obtener nombre y correo de cada solicitante
        const resSol = await fetch(`${backend_url}api/users/${id}`);
        const solicitante = await resSol.json();
  
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
          ${solicitante.nombre} (${solicitante.correo})
          <button class="btn btn-sm btn-success" data-id="${id}">Aceptar</button>
        `;
        lista.appendChild(li);
      }
  
      // Añadir listeners a los botones "Aceptar"
      document.querySelectorAll("#solicitudesPendientes button").forEach(btn => {
        btn.addEventListener("click", async () => {
          const solicitanteId = btn.getAttribute("data-id");
          try {
            const res = await fetch(`${backend_url}api/users/${user._id}/aceptar-colaborador`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ solicitanteId })
            });
  
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Error al aceptar");
  
            alert("Colaborador aceptado con éxito");
            cargarSolicitudesPendientes();
            cargarColaboradores(); // actualiza lista
          } catch (err) {
            alert(err.message);
          }
        });
      });
  
    } catch (err) {
      console.error("Error al cargar solicitudes pendientes:", err);
    }
  }  

  // 🔁 Llamar a la función una vez cargado el usuario
  cargarColaboradores();
  cargarSolicitudesPendientes();

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
