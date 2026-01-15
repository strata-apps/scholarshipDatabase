import { FiltersPanel } from '../components/FiltersPanel.js';
import { SearchBar } from '../components/SearchBar.js';
import { ScholarshipGrid } from '../components/ScholarshipGrid.js';
import { Modal } from '../components/Modal.js';
import { normalize } from '../components/format.js';

export function loadScholarships(mount, scholarships, rerenderApp) {
  const state = {
    q: '',
    region: '',
    gpaMin: null,
    needOnly: false,
    grantOnly: false,
    citizenship: {
      'US Citizen': false,
      'Permanent Resident': false,
      'DACA': false,
      'Undocumented': false,
      'No Citizenship': false
    },
    sort: 'newestClose'
  };

  const regionOptions = Array.from(
    new Set(scholarships.map((s) => s.region).filter(Boolean).map((x) => x.trim()))
  ).sort((a, b) => a.localeCompare(b));

  function mountFloatingFilters(search) {
  // remove existing drawer (avoid duplicates on rerender)
  document.querySelectorAll('.filters-panel').forEach((n) => n.remove());

  const drawer = FiltersPanel({
    state: {
      searchNode: search,
      region: state.region,
      regionOptions,
      gpaMin: state.gpaMin,
      needOnly: state.needOnly,
      grantOnly: state.grantOnly,
      citizenship: state.citizenship
    },
    onUpdate: (patch) => {
      Object.assign(state, patch);
      render();
    },
    onReset: () => {
      state.q = '';
      state.region = '';
      state.gpaMin = null;
      state.needOnly = false;
      state.grantOnly = false;
      Object.keys(state.citizenship).forEach((k) => (state.citizenship[k] = false));
      state.sort = 'newestClose';
      search.setValue('');
      render();
    }
  });

  document.body.appendChild(drawer);
}


  function applyFilters() {
    const q = normalize(state.q);
    const selectedCitizenship = Object.entries(state.citizenship)
      .filter(([, v]) => v)
      .map(([k]) => k);

    let list = scholarships.slice();

    // search
    if (q) {
      list = list.filter((s) => {
        const hay = [
          s.name,
          s.amount,
          s.region,
          (s.tags || []).join(' '),
          s.requirements
        ].map(normalize).join(' • ');
        return hay.includes(q);
      });
    }

    // region
    if (state.region) {
      list = list.filter((s) => (s.region || '') === state.region);
    }

    // gpa
    if (state.gpaMin != null) {
      list = list.filter((s) => s.gpaMin == null || Number(s.gpaMin) >= Number(state.gpaMin));
    }

    // need-based
    if (state.needOnly) {
      list = list.filter((s) => !!s.needBased);
    }

    // grants
    if (state.grantOnly) {
      list = list.filter((s) => !!s.grant);
    }


    // citizenship: if any selected, scholarship must include at least one selected
    if (selectedCitizenship.length) {
      list = list.filter((s) => {
        const c = Array.isArray(s.citizenship) ? s.citizenship : [];
        return c.some((x) => selectedCitizenship.includes(x));
      });
    }

    // sort
    if (state.sort === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (state.sort === 'amount') {
      // crude numeric sort by extracted digits
      const toN = (x) => {
        const digits = String(x || '').replace(/[^0-9]/g, '');
        return digits ? Number(digits) : -1;
      };
      list.sort((a, b) => toN(b.amount) - toN(a.amount));
    } else {
      // newestClose: by closeDate descending (unknowns last)
      list.sort((a, b) => {
        const ad = a.closeDate ? new Date(a.closeDate).getTime() : -Infinity;
        const bd = b.closeDate ? new Date(b.closeDate).getTime() : -Infinity;
        return bd - ad;
      });
    }

    return list;
  }

  function openDetails(item) {
    const content = document.createElement('div');

    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.flexDirection = 'column';
    left.style.gap = '10px';

    const req = document.createElement('div');
    req.className = 'kv';
    req.innerHTML = `<h4>Requirements</h4><p>${escapeHtml(item.requirements || '—')}</p>`;

    const tags = document.createElement('div');
    tags.className = 'kv';
    tags.innerHTML = `<h4>Tags</h4><p>${escapeHtml((item.tags || []).join(', ') || '—')}</p>`;

    left.appendChild(req);
    left.appendChild(tags);

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.flexDirection = 'column';
    right.style.gap = '10px';

    right.appendChild(kv('Amount', item.amount || '—'));
    right.appendChild(kv('Region', item.region || '—'));
    right.appendChild(kv('Minimum GPA', item.gpaMin != null ? String(item.gpaMin) : '—'));
    right.appendChild(kv('Citizenship', (item.citizenship || []).join(', ') || '—'));
    right.appendChild(kv('Need-based', item.needBased ? 'Yes' : 'No'));
    right.appendChild(kv('Open Date', item.openDate || '—'));
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

    // Search node used inside FiltersPanel
    const search = SearchBar({ value: state.q });


    const left = FiltersPanel({
      state: {
        searchNode: search,
        region: state.region,
        regionOptions,
        gpaMin: state.gpaMin,
        needOnly: state.needOnly,
        grantOnly: state.grantOnly,
        citizenship: state.citizenship
      },
      onUpdate: (patch) => {
        Object.assign(state, patch);
        render();
      },
      onReset: () => {
        state.q = '';
        state.region = '';
        state.gpaMin = null;
        state.needOnly = false;
        state.grantOnly = false;
        Object.keys(state.citizenship).forEach((k) => (state.citizenship[k] = false));
        state.sort = 'newestClose';
        render();
      }
    });

    const main = document.createElement('main');
    main.className = 'main';

    const list = applyFilters();

    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';

    const tl = document.createElement('div');
    tl.className = 'toolbar-left';
    tl.innerHTML = `<div class="kpi">Showing <span>${list.length}</span> scholarships</div>`;

    const sort = document.createElement('div');
    sort.className = 'sort';
    sort.innerHTML = `Sort by:`;

    const sel = document.createElement('select');
    sel.innerHTML = `
      <option value="newestClose">Closest deadline</option>
      <option value="amount">Highest amount</option>
      <option value="name">Name A–Z</option>
    `;
    sel.value = state.sort;
    sel.addEventListener('change', () => {
      state.sort = sel.value;
      render();
    });

    sort.appendChild(sel);
    toolbar.appendChild(tl);
    toolbar.appendChild(sort);

    main.appendChild(toolbar);
    main.appendChild(
      ScholarshipGrid({
        items: list,
        onOpen: openDetails,
        onFavoriteChanged: rerenderApp
      })
    );

    page.appendChild(left);
    page.appendChild(main);

    mount.appendChild(page);
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
