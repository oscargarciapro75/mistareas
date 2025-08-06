async function loadTasks() {
  const res = await fetch('/api/tasks');
  const tasks = await res.json();
  const list = document.getElementById('tasks');
  list.innerHTML = '';
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.textContent = `${t.titulo} - ${t.descripcion} `;
    const select = document.createElement('select');
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
    list.appendChild(li);
  });
}

document.getElementById('taskForm').addEventListener('submit', async e => {
  e.preventDefault();
  const titulo = document.getElementById('titulo').value;
  const descripcion = document.getElementById('descripcion').value;
  const estado = document.getElementById('estado').value;
  await fetch('/api/tasks', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({titulo, descripcion, estado})
  });
  e.target.reset();
  loadTasks();
});

window.onload = loadTasks;
