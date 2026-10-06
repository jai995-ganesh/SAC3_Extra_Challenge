let columns = [
  { id: 1, title: "Column 1", color: "#e3f2fd" },
  { id: 2, title: "Column 2", color: "#fce4ec" },
  { id: 3, title: "Column 3", color: "#e8f5e9" },
  { id: 4, title: "Column 4", color: "#fff3e0" }
];

let editingId = null;
let draggedId = null;

const grid = document.getElementById("grid");
const columnCount = document.getElementById("columnCount");
const modal = document.getElementById("editModal");
const titleInput = document.getElementById("titleInput");
const colorInput = document.getElementById("colorInput");

function render() {
  const count = Number(columnCount.value);

  while (columns.length < count) {
    const id = Date.now() + columns.length;
    columns.push({
      id,
      title: "Column " + (columns.length + 1),
      color: "#ffffff"
    });
  }

  if (columns.length > count) {
    columns = columns.slice(0, count);
  }

  grid.style.gridTemplateColumns = `repeat(${count}, 1fr)`;
  grid.innerHTML = "";

  columns.forEach((column, index) => {
    const div = document.createElement("div");
    div.className = "column";
    div.draggable = true;
    div.style.backgroundColor = column.color;
    div.dataset.id = column.id;

    div.innerHTML = `
      <div>
        <h2>${escapeHtml(column.title)}</h2>
        <p><strong>Position:</strong> ${index + 1}</p>
      </div>

      <div class="column-controls">
        <input class="order-input" type="number" min="1" max="${columns.length}"
               value="${index + 1}" title="Order">
        <button class="edit-btn">Edit</button>
      </div>
    `;

    div.querySelector(".edit-btn").addEventListener("click", () => openEdit(column.id));

    div.querySelector(".order-input").addEventListener("change", (event) => {
      let newPosition = Number(event.target.value);

      if (newPosition < 1) newPosition = 1;
      if (newPosition > columns.length) newPosition = columns.length;

      const oldIndex = columns.findIndex(c => c.id === column.id);
      const [moved] = columns.splice(oldIndex, 1);
      columns.splice(newPosition - 1, 0, moved);

      render();
    });

    div.addEventListener("dragstart", () => {
      draggedId = column.id;
    });

    div.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    div.addEventListener("drop", (event) => {
      event.preventDefault();

      if (draggedId === column.id) return;

      const fromIndex = columns.findIndex(c => c.id === draggedId);
      const toIndex = columns.findIndex(c => c.id === column.id);

      const [moved] = columns.splice(fromIndex, 1);
      columns.splice(toIndex, 0, moved);

      render();
    });

    grid.appendChild(div);
  });
}

function openEdit(id) {
  editingId = id;
  const column = columns.find(c => c.id === id);

  titleInput.value = column.title;
  colorInput.value = column.color;
  modal.classList.remove("hidden");
}

document.getElementById("saveBtn").addEventListener("click", () => {
  const column = columns.find(c => c.id === editingId);

  if (column) {
    column.title = titleInput.value || column.title;
    column.color = colorInput.value || "#ffffff";
  }

  modal.classList.add("hidden");
  render();
});

document.getElementById("cancelBtn").addEventListener("click", () => {
  modal.classList.add("hidden");
});

document.getElementById("plusBtn").addEventListener("click", () => {
  columnCount.value = Number(columnCount.value) + 1;
  render();
});

document.getElementById("minusBtn").addEventListener("click", () => {
  if (Number(columnCount.value) > 1) {
    columnCount.value = Number(columnCount.value) - 1;
    render();
  }
});

columnCount.addEventListener("change", () => {
  if (Number(columnCount.value) < 1) columnCount.value = 1;
  if (Number(columnCount.value) > 12) columnCount.value = 12;
  render();
});

document.querySelectorAll(".color-options button").forEach(button => {
  button.addEventListener("click", () => {
    colorInput.value = button.dataset.color;
  });
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
