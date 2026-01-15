// FiltersPanel.js
export function FiltersPanel({ state, onUpdate, onReset }) {
  const panel = document.createElement('aside');

  // UPDATED: add a class specifically for the responsive drawer behavior
  panel.className = 'panel filters-panel';
  panel.setAttribute('aria-label', 'Filters');

  const header = document.createElement('div');
  header.className = 'panel-header';

  // UPDATED: close button for mobile drawer mode (CSS will hide it on desktop)
  header.innerHTML = `
    <div class="panel-header-row">
      <div>
        <p class="panel-title">Search</p>
      </div>

      <button class="filters-close" type="button" aria-label="Close filters">
        ✕
      </button>
    </div>

    <p class="panel-sub">
      Select the filters that are the most appropriate for you! Click apply to view all the scholarships you can apply for!
      Heart your favorite scholarships to save them in your favorites screen!
    </p>
  `;

  const body = document.createElement('div');
  body.className = 'panel-body';

  // UPDATED: close behavior (mobile drawer)
  const closeBtn = header.querySelector('.filters-close');
  closeBtn?.addEventListener('click', () => {
    document.body.classList.remove('filters-open');
  });

  // Search
  body.appendChild(state.searchNode.node);

  // Region
  const region = document.createElement('div');
  region.className = 'field';
  region.innerHTML = `<label>Region</label>`;
  const regionSel = document.createElement('select');
  regionSel.className = 'select';
  regionSel.innerHTML = `
    <option value="">All</option>
    ${state.regionOptions
      .map(
        (r) =>
          `<option ${state.region === r ? 'selected' : ''} value="${escapeHtml(r)}">${escapeHtml(r)}</option>`
      )
      .join('')}
  `;
  regionSel.addEventListener('change', () => onUpdate({ region: regionSel.value }));
  region.appendChild(regionSel);
  body.appendChild(region);

  // GPA min
  //const gpa = document.createElement('div');
  //gpa.className = 'field';
  //gpa.innerHTML = `<label>Minimum GPA (at least)</label>`;
  //const gpaInput = document.createElement('input');
  //gpaInput.className = 'input';
  //gpaInput.type = 'number';
  //gpaInput.step = '0.1';
  //gpaInput.min = '0';
  //gpaInput.placeholder = 'e.g. 3.0';
  //gpaInput.value = state.gpaMin ?? '';
  //gpaInput.addEventListener('input', () => {
    //const val = gpaInput.value === '' ? null : Number(gpaInput.value);
    //onUpdate({ gpaMin: Number.isFinite(val) ? val : null });
  //});
  //gpa.appendChild(gpaInput);
  //body.appendChild(gpa);
  // Citizenship checkboxes
  const checksWrap = document.createElement('div');
  checksWrap.className = 'checks';

  const checkTitle = document.createElement('div');
  checkTitle.style.fontWeight = '950';
  checkTitle.style.color = 'var(--muted)';
  checkTitle.style.fontSize = '12px';
  checkTitle.textContent = 'Citizenship eligibility';
  body.appendChild(checkTitle);

  const options = [
    { key: 'US Citizen', label: 'US Citizen' },
    { key: 'Permanent Resident', label: 'Permanent Resident' },
    { key: 'DACA', label: 'DACA' },
    { key: 'Undocumented', label: 'Undocumented' },
    { key: 'No Citizenship', label: 'No Citizenship' },
  ];

  options.forEach((opt) => {
    const row = document.createElement('div');
    row.className = 'check';

    const left = document.createElement('div');
    left.className = 'check-left';
    left.innerHTML = `<div>${opt.label}</div>`;

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!state.citizenship[opt.key];
    cb.addEventListener('change', () => {
      onUpdate({ citizenship: { ...state.citizenship, [opt.key]: cb.checked } });
    });

    row.appendChild(left);
    row.appendChild(cb);
    checksWrap.appendChild(row);
  });

  body.appendChild(checksWrap);

  // Need-based toggle
  const need = document.createElement('div');
  need.className = 'check';
  need.innerHTML = `
    <div class="check-left">
      <div>Need-based</div>
      <span>Only show need-based scholarships</span>
    </div>
  `;
  const needCb = document.createElement('input');
  needCb.type = 'checkbox';
  needCb.checked = !!state.needOnly;
  needCb.addEventListener('change', () => onUpdate({ needOnly: needCb.checked }));
  need.appendChild(needCb);
  body.appendChild(need);

  // Grants toggle 
  const grant = document.createElement('div');
  grant.className = 'check';
  grant.innerHTML = `
    <div class="check-left">
      <div>Grants</div>
      <span>Only show grant opportunities</span>
    </div>
  `;
  const grantCb = document.createElement('input');
  grantCb.type = 'checkbox';
  grantCb.checked = !!state.grantOnly;
  grantCb.addEventListener('change', () => onUpdate({ grantOnly: grantCb.checked }));
  grant.appendChild(grantCb);
  body.appendChild(grant);


  // Buttons
  const btnRow = document.createElement('div');
  btnRow.className = 'row';

  const reset = document.createElement('button');
  reset.className = 'btn secondary';
  reset.textContent = 'Reset';

  const apply = document.createElement('button');
  apply.className = 'btn';
  apply.textContent = 'Apply';

  reset.addEventListener('click', onReset);
  apply.addEventListener('click', () => {
    onUpdate({
      q: state.searchNode.getValue()
    });
    document.body.classList.remove('filters-open'); // optional UX
  });


  btnRow.appendChild(reset);
  btnRow.appendChild(apply);
  body.appendChild(btnRow);

  panel.appendChild(header);
  panel.appendChild(body);
  return panel;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[m]));
}
