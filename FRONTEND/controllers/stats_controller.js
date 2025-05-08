import { backend_url } from '../controllers/env.js';
import { getAuthHeaders } from '../controllers/auth_controllers.js';

export async function cargarEstadisticas() {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  if (!user.token) return;

  try {
    const res = await fetch(`${backend_url}api/productos`, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error al obtener productos:", errorText);
      return;
    }

    const productos = await res.json();

    if (!Array.isArray(productos)) {
      console.error("La respuesta no es un array:", productos);
      return;
    }

    const compras = productos.filter(p => p.type === 'shoppingList');

    // Mostrar mensaje si no hay compras
    const mensaje = document.getElementById('mensajeVacio');
    const totalElem = document.getElementById('totalGastado');
    const grafica = document.getElementById('graficaPastel');

    if (compras.length === 0) {
      mensaje.textContent = 'Aún no has registrado productos comprados.';
      totalElem.textContent = '';
      grafica.style.display = 'none';
      return;
    }

    mensaje.textContent = '';
    grafica.style.display = 'block';

    const agregados = {};
    let totalGasto = 0;

    compras.forEach(p => {
      const nombre = p.name;
      const cantidad = parseInt(p.quantity || 1);
      const precio = parseFloat(p.price || 0);
      const total = cantidad * precio;

      if (!agregados[nombre]) agregados[nombre] = 0;
      agregados[nombre] += total;

      totalGasto += total;
    });

    totalElem.textContent = `Total gastado: $${totalGasto.toFixed(2)} MXN`;

    const labels = Object.keys(agregados);
    const data = Object.values(agregados);

    renderGrafica(labels, data);

    // Gráfica de categoría
    const gastosPorCategoria = {};
    compras.forEach(p => {
    const categoria = p.category || "Sin categoría";
    const total = parseFloat(p.price || 0) * parseInt(p.quantity || 1);
    if (!gastosPorCategoria[categoria]) gastosPorCategoria[categoria] = 0;
    gastosPorCategoria[categoria] += total;
    });

    const categorias = Object.keys(gastosPorCategoria);
    const totales = Object.values(gastosPorCategoria);

    renderGraficaCategorias(categorias, totales);


  } catch (error) {
    console.error("Error inesperado en cargarEstadisticas:", error);
  }
}

function renderGrafica(labels, data) {
  const ctx = document.getElementById('graficaPastel');

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#f44336', '#ffc107', '#4dd0e1', '#546e7a', '#9575cd', '#81c784'],
        borderWidth: 0,
        hoverOffset: 20
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
        datalabels: {
          color: '#ffffff',
          font: { weight: 'bold', size: 14 },
          formatter: function(value, context) {
            return context.chart.data.labels[context.dataIndex];
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}


function renderGraficaCategorias(categorias, totales) {
    const ctx = document.getElementById('graficaCategorias');
  
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categorias,
        datasets: [{
          label: 'Gasto por categoría',
          data: totales,
          backgroundColor: ['#4caf50', '#ff9800', '#03a9f4', '#ab47bc', '#ff5722', '#cddc39'],
          borderRadius: 5
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: ctx => `$${ctx.parsed.y.toFixed(2)} MXN`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#ffffff',
              font: { weight: 'bold' }
            }
          },
          y: {
            beginAtZero: true,
            grid: { display: false },
            ticks: {
              color: '#ffffff',
              callback: value => `$${value}`,
              font: { weight: 'bold' }
            }
          }
        }
      }
    });
}
  