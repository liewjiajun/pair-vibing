async function loadNotes() {
  const res = await fetch('/notes');
  const notes = await res.json();
  const ul = document.getElementById('notes');
  ul.innerHTML = '';
  notes.forEach((n) => {
    const li = document.createElement('li');
    li.textContent = n.title;
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.onclick = () => deleteNote(n.id);
    li.appendChild(del);
    ul.appendChild(li);
  });
}

// NOTE: index.html calls addNote() — this is named createNote(). Planted wiring bug.
async function createNote() {
  const title = document.getElementById('title').value;
  await fetch('/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  loadNotes();
}

async function deleteNote(id) {
  await fetch('/notes/' + id, { method: 'DELETE' });
  loadNotes();
}

loadNotes();
