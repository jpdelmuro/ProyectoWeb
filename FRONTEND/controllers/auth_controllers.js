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

// LOGIN
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
      const recordar = document.getElementById("recordar").checked;

      const userData = JSON.stringify({
        token: data.token,
        user: {
          _id: data.user.id,       
          nombre: data.user.nombre,
          correo: data.user.correo,
          pass: pass
        }
      });

      if (recordar) {
        localStorage.setItem("user", userData);
      } else {
        sessionStorage.setItem("user", userData);
      }

      window.location.href = frontend_url + 'index.html';
    })
    .catch(err => {
      alert(err.message);
    });
}

// REGISTRO
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
        token: "demo-token",  
        user: {
          _id: user._id,
          nombre: user.nombre,
          correo: user.correo,
          pass: pass
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
  localStorage.removeItem("user");
  window.location.href = frontend_url + 'login.html';
}


// Modal de edición
export function populateModal() {
  const data = JSON.parse(sessionStorage.getItem("user") || '{}');
  const user = data.user || {};
  document.getElementById('editName').value = user.nombre || "";
  document.getElementById('editEmail').value = user.correo || "";
  document.getElementById('editPwd').value = "";
}

// Mostrar nombre del usuario en la página
export function init() {
  const data = JSON.parse(sessionStorage.getItem("user") || '{}');
  const user = data.user || {};
  const nameElement = document.getElementById('user-name') || document.getElementById('userNameWidget');
  if (nameElement) {
    nameElement.innerText = user.nombre || "";
  }
}

// Guardar y eliminar desde modal
document.addEventListener('DOMContentLoaded', () => {
  const data = JSON.parse(sessionStorage.getItem("user") || '{}');
  const user = data.user || {};

  // Modal editar
  const modalEdit = document.getElementById('modalEdit');
  if (modalEdit) {
    modalEdit.addEventListener('shown.bs.modal', populateModal);
  }

  // Form editar
  const formEdit = document.getElementById('formEditUser');
  if (formEdit) {
    formEdit.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('editName').value;
      const correo = document.getElementById('editEmail').value;
      const pass = document.getElementById('editPwd').value;

      try {
        const res = await fetch(`${backend_url}api/users/${user._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, correo, pass })
        });

        if (!res.ok) throw new Error("Error al actualizar");

        const updated = await res.json();
        sessionStorage.setItem("user", JSON.stringify({
          token: data.token,
          user: updated
        }));
        alert("Usuario actualizado con éxito");
        init();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Eliminar
  const btnDelete = document.getElementById('btnDeleteUser');
  if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
      try {
        const res = await fetch(`${backend_url}api/users/${user._id}`, {
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


export function getAuthHeaders() {
  const parsed = JSON.parse(sessionStorage.getItem("user") || '{}');
  return {
    'Content-Type': 'application/json',
    'Authorization': parsed.token || ""
  };
}
