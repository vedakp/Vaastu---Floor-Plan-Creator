const canvas = document.getElementById('floorCanvas');
const ctx = canvas.getContext('2d');

// Constants
const SCALE = 5; // 1 ft = 5 px
let zoom = 1;

// State
let outerBoundary = null;
let rooms = [];
let selectedRoomIndex = null;
let draggingRoom = null;
let dragOffset = { x: 0, y: 0 };

// Map pointer position to fixed canvas coordinates
function getPointerPos(evt) {
  const rect = canvas.getBoundingClientRect();
  const x = (evt.clientX - rect.left) * (canvas.width / rect.width);
  const y = (evt.clientY - rect.top) * (canvas.height / rect.height);
  return { x: x / zoom, y: y / zoom };
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (outerBoundary) {
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      outerBoundary.x,
      outerBoundary.y,
      outerBoundary.width,
      outerBoundary.height
    );
  }

  rooms.forEach((r, i) => {
    ctx.fillStyle = i === selectedRoomIndex ? '#6fa8dc' : '#999';
    ctx.fillRect(r.x, r.y, r.width, r.height);
    ctx.fillStyle = '#000';
    ctx.fillText(r.title, r.x + 4, r.y + 14);
  });
}

// Create floor plan
document.getElementById('createBoundaryBtn').onclick = () => {
  const wFt = parseFloat(document.getElementById('outerWidthFeet').value);
  const hFt = parseFloat(document.getElementById('outerHeightFeet').value);
  if (isNaN(wFt) || isNaN(hFt)) return;

  outerBoundary = {
    x: (canvas.width - wFt * SCALE) / 2,
    y: (canvas.height - hFt * SCALE) / 2,
    width: wFt * SCALE,
    height: hFt * SCALE
  };
  rooms = [];
  selectedRoomIndex = null;
  draw();
};

// Add room
document.getElementById('addRoomBtn').onclick = () => {
  if (!outerBoundary) return;
  const title = document.getElementById('roomTitle').value.trim();
  const wFt = parseFloat(document.getElementById('widthFeet').value);
  const hFt = parseFloat(document.getElementById('heightFeet').value);
  if (!title || isNaN(wFt) || isNaN(hFt)) return;

  rooms.push({
    x: outerBoundary.x + 10,
    y: outerBoundary.y + 10,
    width: wFt * SCALE,
    height: hFt * SCALE,
    title
  });
  selectedRoomIndex = rooms.length - 1;
  draw();
};

// Pointer events for drag (works for mouse, touch, pen)
canvas.addEventListener('pointerdown', e => {
  e.preventDefault();
  const pos = getPointerPos(e);
  draggingRoom = null;
  selectedRoomIndex = null;

  for (let i = rooms.length - 1; i >= 0; i--) {
    const r = rooms[i];
    if (
      pos.x > r.x &&
      pos.x < r.x + r.width &&
      pos.y > r.y &&
      pos.y < r.y + r.height
    ) {
      draggingRoom = r;
      selectedRoomIndex = i;
      dragOffset.x = pos.x - r.x;
      dragOffset.y = pos.y - r.y;
      break;
    }
  }
  draw();
});

canvas.addEventListener('pointermove', e => {
  if (!draggingRoom) return;
  e.preventDefault();
  const pos = getPointerPos(e);
  let nx = pos.x - dragOffset.x;
  let ny = pos.y - dragOffset.y;

  // Constrain inside boundary
  if (outerBoundary) {
    nx = Math.max(
      outerBoundary.x,
      Math.min(nx, outerBoundary.x + outerBoundary.width - draggingRoom.width)
    );
    ny = Math.max(
      outerBoundary.y,
      Math.min(ny, outerBoundary.y + outerBoundary.height - draggingRoom.height)
    );
  }

  draggingRoom.x = nx;
  draggingRoom.y = ny;
  draw();
});

canvas.addEventListener('pointerup', () => {
  draggingRoom = null;
});
canvas.addEventListener('pointercancel', () => {
  draggingRoom = null;
});

// Optional: prevent pinch‑zoom/scroll when interacting
canvas.addEventListener(
  'touchstart',
  e => {
    if (e.touches.length > 1) e.preventDefault();
  },
  { passive: false }
);

// Initial draw
draw();
