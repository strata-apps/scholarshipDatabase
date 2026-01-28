// screens/favorites.js
import { Modal } from '../components/Modal.js';
import { getFavorites, clearFavorites, toggleFavorite } from '../components/storage.js';
import { ProgressCheck } from '../components/progressCheck.js';
import { StatusButton } from '../components/statusButton.js';
import { FavoritesExportButton } from '../components/favoritesExport.js';

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
      </div>
      <div class="panel-body" id="favPanelBtns">
        <button class="btn secondary" id="clearFavs">Clear favorites</button>
      </div>
    `;

    const main = document.createElement('main');
    main.className = 'main';

    const favIds = new Set(getFavorites());
    const favItems = scholarships.filter((s) => favIds.has(s.id));

    // Add export button to the sidebar
    const exportBtn = FavoritesExportButton({
      items: favItems,
      filenamePrefix: 'scholarship_favorites',
      label: 'Export favorites (CSV)'
    });

left.querySelector('.panel-body').appendChild(exportBtn);

    // (NEW) progress check at the top of the favorites screen
    const progress = ProgressCheck({
      favItems,
      onChanged: () => {
        // goal change or status map change: update bars + keep UI consistent
        progress.__pcRefresh?.();
      }
    });
    main.appendChild(progress);

    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';
    toolbar.innerHTML = `
      <div class="toolbar-left">
        <div class="kpi" style="margin-bottom: 20px;">Saved <span>${favItems.length}</span> scholarships</div>
      </div>
      <div class="sort">
        <a class="btn secondary" href="#/board" style="padding:8px 12px; margin-bottom: 20px;">Back to Board</a>
      </div>
    `;
    main.appendChild(toolbar);

    // (NEW) Render grid directly (so we can attach StatusButton per card)
    const grid = document.createElement('div');
    grid.className = 'grid';

    if (!favItems.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = '';
      main.appendChild(empty);
    } else {
      favItems.forEach((item) => {
        const card = document.createElement('article');
        card.className = 'card';

        const top = document.createElement('div');
        top.className = 'card-top';

        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = item.name || 'Scholarship';

        const sub = document.createElement('div');
        sub.className = 'card-sub';
        sub.textContent = [item.region, item.closeDate ? `Closes ${item.closeDate}` : null]
          .filter(Boolean)
          .join(' • ') || '—';

        top.appendChild(title);
        top.appendChild(sub);

        const mid = document.createElement('div');
        mid.className = 'card-mid';

        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = item.amount ? `Amount: ${item.amount}` : 'Amount: —';

        mid.appendChild(badge);

        const actions = document.createElement('div');
        actions.className = 'fav-actions';

        const leftActions = document.createElement('div');
        leftActions.style.display = 'flex';
        leftActions.style.gap = '10px';
        leftActions.style.flexWrap = 'wrap';

        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn secondary';
        viewBtn.type = 'button';
        viewBtn.textContent = 'View';
        viewBtn.addEventListener('click', () => openDetails(item));

        const unfavBtn = document.createElement('button');
        unfavBtn.className = 'btn secondary';
        unfavBtn.type = 'button';
        unfavBtn.textContent = 'Unfavorite';
        unfavBtn.addEventListener('click', () => {
          toggleFavorite(item.id);
          rerenderApp(); // will rerender favorites screen + top nav count
        });

        leftActions.appendChild(viewBtn);
        leftActions.appendChild(unfavBtn);

        // (NEW) status selector
        const status = StatusButton({
          id: item.id,
          onChange: () => {
            // status affects purple/green totals; refresh the bars
            progress.__pcRefresh?.();
          }
        });

        actions.appendChild(leftActions);
        actions.appendChild(status);

        card.appendChild(top);
        card.appendChild(mid);
        card.appendChild(actions);

        grid.appendChild(card);
      });

      main.appendChild(grid);
    }

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
  return String(s).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}
