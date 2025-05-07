import { backend_url, frontend_url } from '../controllers/env.js';

document.addEventListener("DOMContentLoaded", () => {
  const sessionData = sessionStorage.getItem("user");

  if (!sessionData) {
    window.location.href = frontend_url + "login.html";
    return;
  }

  let parsedData;
  try {
    parsedData = JSON.parse(sessionData);
  } catch (error) {
    console.error("Error al parsear sessionStorage user:", error);
    sessionStorage.clear();
    window.location.href = frontend_url + "login.html";
    return;
  }

  const user = parsedData.user;

  if (!user || !user.nombre || !user.correo) {
    alert("Sesión inválida. Inicia sesión nuevamente.");
    sessionStorage.clear();
    window.location.href = frontend_url + "login.html";
    return;
  }
  

  // Mostrar datos actuales
  document.getElementById("editName").value = user.nombre || "";
  document.getElementById("editEmail").value = user.correo || "";

  // Guardar cambios
  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("editName").value;
    const correo = document.getElementById("editEmail").value;
    const currentPwd = document.getElementById("currentPwd").value;
    const newPwd = document.getElementById("newPwd").value;

    if (!currentPwd || currentPwd !== parsedData.user.pass) {
      alert("Debes ingresar correctamente tu contraseña actual para guardar cambios.");
      return;
    }

    const updatedData = {
      nombre,
      correo,
      pass: newPwd ? newPwd : parsedData.user.pass,
    };

    try {
      const res = await fetch(`${backend_url}api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (!res.ok) throw new Error("Error al actualizar usuario");

      const updated = await res.json();
      sessionStorage.setItem("user", JSON.stringify({ token: parsedData.token, user: updated }));

      const modal = new bootstrap.Modal(document.getElementById('modalGuardado'));
      modal.show();
    } catch (err) {
      alert(err.message);
    }
  });

  // Eliminar usuario
  window.eliminarUsuario = async () => {
    const currentPwd = document.getElementById("currentPwd").value;

    if (!currentPwd || currentPwd !== parsedData.user.pass) {
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
