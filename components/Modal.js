// Modal.js
export function Modal({ title, contentNode, onClose }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const header = document.createElement('div');
  header.className = 'modal-header';

  const h = document.createElement('div');
  h.style.display = 'flex';
  h.style.flexDirection = 'column';
  h.style.gap = '2px';

  const t = document.createElement('h3');
  t.className = 'modal-title';
  t.textContent = title;

  h.appendChild(t);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'iconbtn modal-close';
  closeBtn.innerHTML = '✕';

  header.appendChild(h);
  header.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'modal-body';
  body.appendChild(contentNode);

  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);

  // ✅ Lock background scroll
  document.body.classList.add('modal-open');

  // ✅ Centralized close so we always cleanup
  const close = () => {
    document.body.classList.remove('modal-open');
    onClose();
  };

  closeBtn.addEventListener('click', close);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  window.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Escape') close();
    },
    { once: true }
  );

  return overlay;
}
