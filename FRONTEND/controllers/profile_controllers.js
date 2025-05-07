import { backend_url, frontend_url } from '../controllers/env.js';

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) {
    window.location.href = frontend_url + "login.html";
    return;
  }

  // Mostrar datos actuales
  document.getElementById("editName").value = user.nombre;
  document.getElementById("editEmail").value = user.correo;

  // Guardar cambios
  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("editName").value;
    const correo = document.getElementById("editEmail").value;
    const currentPwd = document.getElementById("currentPwd").value;
    const newPwd = document.getElementById("newPwd").value;

    if (!currentPwd || currentPwd !== user.pass) {
      alert("Debes ingresar correctamente tu contraseña actual para guardar cambios.");
      return;
    }

    const body = {
      nombre,
      correo,
      pass: newPwd ? newPwd : user.pass // Si hay nueva, usa esa
    };

    try {
      const res = await fetch(`${backend_url}api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error("Error al actualizar usuario");

      const updated = await res.json();
      sessionStorage.setItem("user", JSON.stringify(updated));

      const modal = new bootstrap.Modal(document.getElementById('modalGuardado'));
      modal.show();
    } catch (err) {
      alert(err.message);
    }
  });

  // Eliminar usuario
  window.eliminarUsuario = async () => {
    const currentPwd = document.getElementById("currentPwd").value;

    if (!currentPwd || currentPwd !== user.pass) {
      alert("Debes ingresar correctamente tu contraseña actual para eliminar el usuario.");
      return;
    }

    try {
      const res = await fetch(`${backend_url}api/users/${user._id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error("Error al eliminar el usuario");

      sessionStorage.clear();

      const modal = new bootstrap.Modal(document.getElementById('modalEliminado'));
      modal.show();

      setTimeout(() => {
        window.location.href = frontend_url + 'login.html';
      }, 2000);
    } catch (err) {
      alert(err.message);
    }
  };
});
