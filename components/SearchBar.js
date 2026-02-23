export function SearchBar({ value = '' }) {
  const field = document.createElement('div');
  field.className = 'field';

  const label = document.createElement('label');
  label.textContent = 'Search manually';

  const input = document.createElement('input');
  input.className = 'input';
  input.placeholder = 'Scholarship name, tag, region, requirements…';

  // LOCAL draft value (not applied yet)
  input.value = value;

  field.appendChild(label);
  field.appendChild(input);

  return {
    node: field,
    getValue: () => input.value,
    setValue: (v) => { input.value = v ?? ''; }
  };
}
