import { backend_url, frontend_url } from '../controllers/env.js';

// Cambia entre formularios de login y registro
export function toggleForms() {
  const form_login = document.getElementById('formLogin');
  const form_register = document.getElementById('formRegister');

  if (form_register.style.display === 'none') {
    form_login.style.display = 'none';
    form_register.style.display = 'block';
  } else {
    form_login.style.display = 'block';
    form_register.style.display = 'none';
  }
}

// LOGIN con sessionStorage que incluye pass (solo demo)
export function login(event) {
  event.preventDefault();

  const correo = document.getElementById('correo').value;
  const pass = document.getElementById('pass').value;

  fetch(`${backend_url}api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, pass })
  })
    .then(response => {
      if (!response.ok) throw new Error("Correo y/o contraseña incorrectos");
      return response.json();
    })
    .then(data => {
      sessionStorage.setItem("user", JSON.stringify({
        token: data.token,
        user: {
          id: data.user.id,
          nombre: data.user.nombre,
          correo: data.user.correo,
          pass: data.user.pass // ⚠️ solo para esta demo
        }
      }));
      window.location.href = frontend_url + 'index.html';
    })
    .catch(err => {
      alert(err.message);
    });
}

// REGISTRO adaptado igual
export function register(event) {
  event.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const correo = document.getElementById('correo').value;
  const pass = document.getElementById('pass').value;
  const confirmPass = document.getElementById('confirmPass').value;

  fetch(`${backend_url}api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, pass, confirmPass })
  })
    .then(response => {
      if (!response.ok) return response.json().then(err => { throw new Error(err.error); });
      return response.json();
    })
    .then(user => {
      sessionStorage.setItem("user", JSON.stringify({
        token: "fake_token_para_demo", // puedes omitir si backend no lo manda
        user: {
          id: user._id,
          nombre: user.nombre,
          correo: user.correo,
          pass: pass // ⚠️ solo para demo
        }
      }));
      window.location.href = frontend_url + 'index.html';
    })
    .catch(err => {
      alert("Error: " + err.message);
    });
}

// Logout
export function logout() {
  sessionStorage.clear();
  window.location.href = frontend_url + 'login.html';
}

// Mostrar datos en modal de perfil
export function populateModal() {
  const parsed = JSON.parse(sessionStorage.getItem("user") || '{}');
  const user = parsed.user || {};

  document.getElementById('editName').value = user.nombre || "";
  document.getElementById('editEmail').value = user.correo || "";
  document.getElementById('editPwd').value = "";
}

// Mostrar nombre del usuario en página
export function init() {
  const parsed = JSON.parse(sessionStorage.getItem("user") || '{}');
  const user = parsed.user || {};

  const nameElement = document.getElementById('user-name') || document.getElementById('userNameWidget');
  if (nameElement) {
    nameElement.innerText = user.nombre || "";
  }
}

// DOM loaded setup para modales
document.addEventListener('DOMContentLoaded', () => {
  const parsed = JSON.parse(sessionStorage.getItem("user") || '{}');
  const user = parsed.user || {};

  const modalEdit = document.getElementById('modalEdit');
  if (modalEdit) {
    modalEdit.addEventListener('shown.bs.modal', populateModal);
  }

  const formEdit = document.getElementById('formEditUser');
  if (formEdit) {
    formEdit.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('editName').value;
      const correo = document.getElementById('editEmail').value;
      const pass = document.getElementById('editPwd').value;

      try {
        const res = await fetch(`${backend_url}api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, correo, pass })
        });

        if (!res.ok) throw new Error("Error al actualizar");

        const updatedUser = await res.json();
        sessionStorage.setItem('user', JSON.stringify({
          token: parsed.token,
          user: updatedUser
        }));

        alert("Usuario actualizado con éxito");
        init();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  const btnDelete = document.getElementById('btnDeleteUser');
  if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
      try {
        const res = await fetch(`${backend_url}api/users/${user.id}`, {
          method: 'DELETE'
        });

        if (!res.ok) throw new Error("Error al eliminar el usuario");

        sessionStorage.clear();
        alert("Usuario eliminado");
        window.location.href = frontend_url + 'login.html';
      } catch (err) {
        alert(err.message);
      }
    });
  }
});

// Para usar en otros fetch con token
export function getAuthHeaders() {
  const parsed = JSON.parse(sessionStorage.getItem("user") || '{}');
  return {
    'Content-Type': 'application/json',
    'Authorization': parsed.token || ""
  };
}
