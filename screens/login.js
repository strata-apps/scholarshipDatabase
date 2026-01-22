// screens/login.js
import { setSession, getLocalUsers, setLocalUsers } from '../components/auth.js';

async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  const bytes = Array.from(new Uint8Array(buf));
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') n.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
    else n.setAttribute(k, v);
  }
  for (const kid of kids) {
    if (kid == null) continue;
    n.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
  }
  return n;
}

export default function renderLoginScreen(mount, onAuthed) {
  mount.innerHTML = '';

  let mode = 'login'; // 'login' | 'register'
  let error = '';
  let success = '';

  const state = {
    // login
    email: '',
    password: '',

    // register
    first_name: '',
    last_name: '',
    reg_email: '',
    reg_password: '',
    organization: 'Camp Catanese',
  };

  const setMsg = (type, msg) => {
    error = type === 'error' ? msg : '';
    success = type === 'success' ? msg : '';
    rerender();
  };

  const doLogin = async (e) => {
    e.preventDefault();
    setMsg('error', '');
    setMsg('success', '');

    const email = state.email.trim().toLowerCase();
    const pw = state.password;

    if (!email || !pw) return setMsg('error', 'Please enter email and password.');

    const users = getLocalUsers();
    const found = users.find(u => (u.email || '').toLowerCase() === email);
    if (!found) return setMsg('error', 'No account found for that email.');

    const hash = await sha256(pw);
    if (hash !== found.password_hash) return setMsg('error', 'Incorrect password.');

    // Session payload (safe fields only)
    setSession({
      id: found.id,
      email: found.email,
      first_name: found.first_name,
      last_name: found.last_name,
      organization: found.organization,
      signed_in_at: new Date().toISOString(),
    });

    onAuthed?.();
  };

  const doRegister = async (e) => {
    e.preventDefault();
    setMsg('error', '');
    setMsg('success', '');

    const first = state.first_name.trim();
    const last = state.last_name.trim();
    const email = state.reg_email.trim().toLowerCase();
    const pw = state.reg_password;
    const org = state.organization;

    if (!first || !last || !email || !pw) return setMsg('error', 'Please complete all fields.');
    if (pw.length < 8) return setMsg('error', 'Password must be at least 8 characters.');

    const users = getLocalUsers();
    if (users.some(u => (u.email || '').toLowerCase() === email)) {
      return setMsg('error', 'An account with that email already exists.');
    }

    const password_hash = await sha256(pw);
    const newUser = {
      id: crypto.randomUUID(),
      first_name: first,
      last_name: last,
      email,
      password_hash,
      organization: org,
      created_at: new Date().toISOString(),
    };

    setLocalUsers([newUser, ...users]);

    // auto-login after register
    setSession({
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      organization: newUser.organization,
      signed_in_at: new Date().toISOString(),
    });

    onAuthed?.();
  };

  const rerender = () => {
    mount.innerHTML = '';

    const msgBox = (error || success)
      ? el('div', { class: 'panel', style: { marginBottom: '16px' } },
          el('div', { class: 'panel-body' },
            el('div', { class: 'badge', style: { background: error ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)' } },
              error || success
            )
          )
        )
      : null;

    const tabs = el('div', { style: { display: 'flex', gap: '10px', marginBottom: '14px' } },
      el('button', {
        class: `btn ${mode === 'login' ? '' : 'secondary'}`,
        type: 'button',
        onclick: () => { mode = 'login'; error = ''; success = ''; rerender(); }
      }, 'Sign In'),
      el('button', {
        class: `btn ${mode === 'register' ? '' : 'secondary'}`,
        type: 'button',
        onclick: () => { mode = 'register'; error = ''; success = ''; rerender(); }
      }, 'Register')
    );

    const loginForm = el('form', { onsubmit: doLogin },
      el('div', {},
        el('label', {}, 'Email'),
        el('input', {
          class: 'input',
          type: 'email',
          value: state.email,
          placeholder: 'you@campcatanese.org',
          oninput: (e) => { state.email = e.target.value; }
        })
      ),
      el('div', {},
        el('label', {}, 'Password'),
        el('input', {
          class: 'input',
          type: 'password',
          value: state.password,
          placeholder: '••••••••',
          oninput: (e) => { state.password = e.target.value; }
        })
      ),
      el('div', { style: { marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'center' } },
        el('button', { class: 'btn', type: 'submit' }, 'Sign In')
      )
    );

    const registerForm = el('form', { onsubmit: doRegister },
      el('div', {},
        el('label', {}, 'First name'),
        el('input', {
          class: 'input',
          value: state.first_name,
          placeholder: 'Darian',
          oninput: (e) => { state.first_name = e.target.value; }
        })
      ),
      el('div', {},
        el('label', {}, 'Last name'),
        el('input', {
          class: 'input',
          value: state.last_name,
          placeholder: 'Benitez Sanchez',
          oninput: (e) => { state.last_name = e.target.value; }
        })
      ),
      el('div', {},
        el('label', {}, 'Email'),
        el('input', {
          class: 'input',
          type: 'email',
          value: state.reg_email,
          placeholder: 'you@campcatanese.org',
          oninput: (e) => { state.reg_email = e.target.value; }
        })
      ),
      el('div', {},
        el('label', {}, 'Password (8+ chars)'),
        el('input', {
          class: 'input',
          type: 'password',
          value: state.reg_password,
          placeholder: '••••••••',
          oninput: (e) => { state.reg_password = e.target.value; }
        })
      ),
      el('div', {},
        el('label', {}, 'Organization'),
        el('select', {
          value: state.organization,
          onchange: (e) => { state.organization = e.target.value; }
        },
          el('option', { value: 'Camp Catanese' }, 'Camp Catanese')
        )
      ),
      el('div', { style: { marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'center' } },
        el('button', { class: 'btn', type: 'submit' }, 'Create Account')
      )
    );

    const card = el('div', { class: 'panel', style: { maxWidth: '720px', margin: '0 auto' } },
      el('div', { class: 'panel-header' },
        el('h3', { class: 'panel-title' }, 'Scholarship Database Access'),
        el('div', { class: 'panel-sub' }, 'Sign in to view scholarships and favorites.')
      ),
      el('div', { class: 'panel-body' },
        tabs,
        mode === 'login' ? loginForm : registerForm
      )
    );

    // Layout wrapper consistent with your app
    const page = el('div', { class: 'page', style: { gridTemplateColumns: '1fr' } },
      el('div', { class: 'panel-stack' }, msgBox, card)
    );

    mount.appendChild(page);
  };

  rerender();
}
