const toggle = document.getElementById('navToggle');
const nav = document.querySelector('.nav');

toggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

// Interactive Newton's cradle
(function () {
  const svg = document.querySelector('.hero-orbit svg');
  const leftEl = document.getElementById('pendulumLeft');
  const rightEl = document.getElementById('pendulumRight');
  if (!svg || !leftEl || !rightEl) return;

  const state = {
    left:  { el: leftEl,  pivotX: 100, pivotY: 70, angle: 0, vel: 0, dragging: false },
    right: { el: rightEl, pivotX: 260, pivotY: 70, angle: 0, vel: 0, dragging: false }
  };

  const GRAVITY = 3.2;       // tuned constant, not real-world units
  const DAMPING = 0.994;     // per-frame velocity decay
  const MAX_DRAG_DEG = 48;

  // side 'left': positive angle swings the ball left (outward).
  // side 'right': positive angle swings the ball right, which requires
  // the opposite CSS rotation sign — same convention used elsewhere on this page.
  function render(side) {
    const s = state[side];
    const cssAngle = side === 'left' ? s.angle : -s.angle;
    s.el.style.transform = `rotate(${cssAngle}deg)`;
  }

  function step() {
    ['left', 'right'].forEach((side) => {
      const s = state[side];
      if (!s.dragging) {
        const rad = s.angle * Math.PI / 180;
        s.vel += -GRAVITY * Math.sin(rad);
        s.vel *= DAMPING;
        const prevAngle = s.angle;
        s.angle += s.vel;

        // Collision: ball swings back through the resting position (angle 0)
        // moving inward — it stops dead and the opposite ball gets the kick.
        if (prevAngle > 0 && s.angle <= 0 && s.vel < 0) {
          const incoming = Math.abs(s.vel);
          s.angle = 0;
          s.vel = 0;
          const other = side === 'left' ? state.right : state.left;
          other.vel += incoming;
        }
        if (s.angle < 0) { s.angle = 0; s.vel = Math.max(s.vel, 0); }
      }
      render(side);
    });
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  function pointerAngle(clientX, clientY, pivotX, pivotY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
    return Math.atan2(loc.x - pivotX, loc.y - pivotY) * 180 / Math.PI;
  }

  function setupDrag(side) {
    const s = state[side];

    s.el.addEventListener('pointerdown', (e) => {
      s.dragging = true;
      s.vel = 0;
      s.el.setPointerCapture(e.pointerId);
    });

    s.el.addEventListener('pointermove', (e) => {
      if (!s.dragging) return;
      const raw = pointerAngle(e.clientX, e.clientY, s.pivotX, s.pivotY);
      const outward = side === 'left' ? -raw : raw;
      s.angle = Math.max(0, Math.min(MAX_DRAG_DEG, outward));
      render(side);
    });

    function release(e) {
      if (!s.dragging) return;
      s.dragging = false;
      try { s.el.releasePointerCapture(e.pointerId); } catch (err) { /* no-op */ }
    }
    s.el.addEventListener('pointerup', release);
    s.el.addEventListener('pointercancel', release);
  }

  setupDrag('left');
  setupDrag('right');
})();
