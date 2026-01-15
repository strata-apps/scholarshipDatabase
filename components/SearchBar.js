export function SearchBar({ value = '', onChange }) {
  const field = document.createElement('div');
  field.className = 'field';

  const label = document.createElement('label');
  label.textContent = 'Search manually';

  const input = document.createElement('input');
  input.className = 'input';
  input.placeholder = 'Scholarship name, tag, region, requirements…';
  input.value = value;

  input.addEventListener('input', () => onChange(input.value));

  field.appendChild(label);
  field.appendChild(input);
  return field;
}
