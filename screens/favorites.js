import { ScholarshipGrid } from '../components/ScholarshipGrid.js';
import { Modal } from '../components/Modal.js';
import { getFavorites, clearFavorites } from '../components/storage.js';

export function renderFavoritesScreen(mount, scholarships, rerenderApp) {
  function openDetails(item) {
    const content = document.createElement('div');

    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.flexDirection = 'column';
    left.style.gap = '10px';

    const req = document.createElement('div');
    req.className = 'kv';
    req.innerHTML = `<h4>Requirements</h4><p>${escapeHtml(item.requirements || '—')}</p>`;

    left.appendChild(req);

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.flexDirection = 'column';
    right.style.gap = '10px';

    right.appendChild(kv('Amount', item.amount || '—'));
    right.appendChild(kv('Region', item.region || '—'));
    right.appendChild(kv('Close Date', item.closeDate || '—'));

    const actions = document.createElement('div');
    actions.className = 'kv';
    actions.innerHTML = `<h4>Link</h4>`;
    const link = document.createElement('a');
    link.className = 'btn';
    link.textContent = 'Open Scholarship Page';
    link.href = item.url || '#';
    link.target = '_blank';
    link.rel = 'noreferrer';
    actions.appendChild(link);
    right.appendChild(actions);

    content.style.display = 'contents';
    content.appendChild(left);
    content.appendChild(right);

    const modal = Modal({
      title: item.name,
      contentNode: content,
      onClose: () => modal.remove()
    });

    document.body.appendChild(modal);
  }

  function render() {
    mount.innerHTML = '';

    const page = document.createElement('div');
    page.className = 'page';

    const left = document.createElement('aside');
    left.className = 'panel';
    left.innerHTML = `
      <div class="panel-header">
        <p class="panel-title">Favorites</p>
        <p class="panel-sub">Scholarships you’ve saved locally on this device.</p>
      </div>
      <div class="panel-body">
        <button class="btn secondary" id="clearFavs">Clear favorites</button>
      </div>
    `;

    const main = document.createElement('main');
    main.className = 'main';

    const favIds = new Set(getFavorites());
    const favItems = scholarships.filter((s) => favIds.has(s.id));

    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';
    toolbar.innerHTML = `
      <div class="toolbar-left">
        <div class="kpi" style="margin-bottom: 20px;">Saved <span>${favItems.length}</span> scholarships</div>
      </div>
      <div class="sort">
        <span>Browse:</span>
        <a class="btn secondary" href="#/board" style="padding:8px 12px; margin-bottom: 20px;">Back to Board</a>
      </div>
    `;

    main.appendChild(toolbar);
    main.appendChild(
      ScholarshipGrid({
        items: favItems,
        onOpen: openDetails,
        onFavoriteChanged: rerenderApp
      })
    );

    page.appendChild(left);
    page.appendChild(main);

    mount.appendChild(page);

    left.querySelector('#clearFavs').addEventListener('click', () => {
      clearFavorites();
      rerenderApp();
    });
  }

  render();
}

function kv(title, val) {
  const box = document.createElement('div');
  box.className = 'kv';
  box.innerHTML = `<h4>${escapeHtml(title)}</h4><p>${escapeHtml(val)}</p>`;
  return box;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
}
