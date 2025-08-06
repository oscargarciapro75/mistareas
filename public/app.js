async function loadTasks() {
  const res = await fetch('/api/tasks');
  const tasks = await res.json();
  const list = document.getElementById('tasks');
  list.innerHTML = '';
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center';

    const text = document.createElement('span');
    text.className = 'flex-grow-1';
    text.textContent = `${t.titulo} - ${t.descripcion}`;
    li.appendChild(text);

    const select = document.createElement('select');
    select.className = 'form-select w-auto ms-2';
    const estados = ['pendiente', 'en_ejecucion', 'finalizado'];
    estados.forEach(e => {
      const option = document.createElement('option');
      option.value = e;
      option.textContent = e.replace('_', ' ');
      select.appendChild(option);
    });
    select.value = t.estado;
    select.onchange = async () => {
      await fetch(`/api/tasks/${t.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({estado: select.value})
      });
      loadTasks();
    };
    li.appendChild(select);

    const createdDiv = document.createElement('div');
    createdDiv.className = 'form-check form-switch ms-3';
    const createdCheck = document.createElement('input');
    createdCheck.className = 'form-check-input';
    createdCheck.type = 'checkbox';
    createdCheck.id = `creada-${t.id}`;
    createdCheck.checked = t.creada;
    createdCheck.onchange = async () => {
      await fetch(`/api/tasks/${t.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({creada: createdCheck.checked})
      });
      loadTasks();
    };
    const createdLabel = document.createElement('label');
    createdLabel.className = 'form-check-label';
    createdLabel.htmlFor = createdCheck.id;
    createdLabel.textContent = 'Creada';
    createdDiv.appendChild(createdCheck);
    createdDiv.appendChild(createdLabel);
    li.appendChild(createdDiv);

    list.appendChild(li);
  });
}

document.getElementById('taskForm').addEventListener('submit', async e => {
  e.preventDefault();
  const titulo = document.getElementById('titulo').value;
  const descripcion = document.getElementById('descripcion').value;
  const estado = document.getElementById('estado').value;
  const creada = document.getElementById('creada').checked;
  await fetch('/api/tasks', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({titulo, descripcion, estado, creada})
  });
  e.target.reset();
  loadTasks();
});

window.onload = loadTasks;
