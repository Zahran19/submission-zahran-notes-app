import './style.css';
import Swal from 'sweetalert2';

const BASE_URL = 'https://notes-api.dicoding.dev/v2';

const loadingIndicator = document.getElementById('loading-indicator');
const notesList = document.getElementById('notes-container');

const fetchNotes = async () => {
  const response = await fetch(`${BASE_URL}/notes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }

  const data = await response.json();
  return data.data; // Return notes array from API
};

const createNote = async (note) => {
  const response = await fetch(`${BASE_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    throw new Error('Failed to create note');
  }

  const data = await response.json();
  return data.data; // Return newly created note data
};

const deleteNote = async (id) => {
  const response = await fetch(`${BASE_URL}/notes/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete note');
  }

  const data = await response.json();
  return data; // Return deletion status
};

async function renderNotes() {
  loadingIndicator.show(); // Show loading indicator using method
  try {
    const notesData = await fetchNotes();
    console.log('Fetched Notes Data:', notesData); // Debugging log

    notesList.innerHTML = ''; // Clear existing notes
    notesData.forEach((note) => {
      const noteItem = document.createElement('note-item');
      noteItem.noteData = note; // Set note data

      noteItem.addEventListener('delete-note', async (event) => {
        await handleDelete(event.detail.id);
      });

      notesList.appendChild(noteItem);
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan!',
      text: 'Gagal memuat catatan. Silakan coba lagi.',
    });
  } finally {
    loadingIndicator.hide(); // Hide loading indicator using method
  }
}


document.addEventListener('DOMContentLoaded', () => {
  if (!loadingIndicator || !notesList) {
    console.error('Loading indicator or notes list not found in the DOM.');
    return;
  }

  renderNotes(); // Load and render notes initially
});

// Handle Add Note
async function handleAddNote(note) {
  try {
    const noteData = {
      title: note.title,
      body: note.body,
    };
    const newNote = await createNote(noteData);

    if (note.archived) {
      await handleArchive(newNote.id);
    }

    renderNotes();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan!',
      text: error.message,
    });
  }
}

// Handle Delete
async function handleDelete(id) {
  try {
    await deleteNote(id);
    renderNotes(); // Refresh notes after deleting
  } catch (error) {
    console.error('Error deleting note:', error);
    Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan!',
      text: 'Gagal menghapus catatan. Silakan coba lagi.',
    });
  }
}

// Custom Elements
class AppBar extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <h1>
        <span class="icon">📝</span> Zahran's Notes-App
      </h1>
    `;
  }
}

class NoteForm extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <form id="note-form">
        <input type="text" id="note-title" placeholder="Judul Catatan" required />
        <textarea id="note-body" rows="4" placeholder="Konten Catatan" required></textarea>
        <button type="submit" disabled>Tambah Catatan</button>
      </form>
    `;

    this.form = this.querySelector('#note-form');
    this.titleInput = this.querySelector('#note-title');
    this.bodyInput = this.querySelector('#note-body');
    this.submitButton = this.querySelector('button');

    // Realtime Validation
    this.titleInput.addEventListener('input', () => this.checkForm());
    this.bodyInput.addEventListener('input', () => this.checkForm());

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addNote();
    });
  }

  checkForm() {
    const isTitleValid = this.titleInput.value.trim() !== '';
    const isBodyValid = this.bodyInput.value.trim() !== '';
    this.submitButton.disabled = !(isTitleValid && isBodyValid);
  }

  async addNote() {
    const noteData = {
      title: this.titleInput.value.trim(),
      body: this.bodyInput.value.trim(),
      archived: false,
    };

    await handleAddNote(noteData); // Create the new note through API
    this.form.reset();
    this.submitButton.disabled = true;
  }
}

class NoteItem extends HTMLElement {
  constructor() {
    super();
  }

  set noteData(note) {
    this.innerHTML = `
      <div class="note-item">
        <h3>${note.title}</h3>
        <p>${note.body}</p>
        <small>${new Date(note.createdAt).toLocaleDateString()}</small>
        <button class="delete-btn">Hapus</button>
      </div>
    `;

    // Handle delete button
    this.querySelector('.delete-btn').addEventListener('click', () => {
      const deleteEvent = new CustomEvent('delete-note', {
        detail: { id: note.id },
      });
      this.dispatchEvent(deleteEvent);
    });
  }
}

class LoadingIndicator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isVisible = false;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .loading {
          display: none;
          align-items: center;
          justify-content: center;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7); /* Darker background for better contrast */
          z-index: 9999;
          transition: opacity 0.3s ease; /* Smooth fade effect */
        }
        .loading.active {
          display: flex;
          opacity: 1; /* Fully visible when active */
        }
        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.2); /* Lighter border */
          width: 48px; /* Slightly larger size */
          height: 48px;
          border-radius: 50%;
          border-top-color: #ffcc00; /* Gold color for the top */
          animation: spin 1s linear infinite; /* Linear spin animation */
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      <div class="loading">
        <div class="spinner"></div>
      </div>
    `;
  }

  show() {
    this.isVisible = true;
    this.shadowRoot.querySelector('.loading').classList.add('active');
  }

  hide() {
    this.isVisible = false;
    this.shadowRoot.querySelector('.loading').classList.remove('active');
  }
}

if (!customElements.get('loading-indicator')) {
  customElements.define('loading-indicator', LoadingIndicator);
}

// Register Custom Elements
if (!customElements.get('app-bar')) {
  customElements.define('app-bar', AppBar);
}
if (!customElements.get('note-form')) {
  customElements.define('note-form', NoteForm);
}
if (!customElements.get('note-item')) {
  customElements.define('note-item', NoteItem);
}