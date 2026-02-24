// screens/login.js
import { supabase } from '../components/lib/supabase.js';
import { setSessionFromSupabase } from '../components/auth.js';

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

    const { data, error: err } = await supabase.auth.signInWithPassword({
      email,
      password: pw,
    });

    if (err) return setMsg('error', err.message);

    // sync local cache + route
    await setSessionFromSupabase();

    if (!data?.session) {
      return setMsg('error', 'Signed in, but no session returned. Check your Supabase Auth settings.');
    }

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

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        // stored in auth.users.user_metadata
        data: { first_name: first, last_name: last, organization: org },
      },
    });

    if (err) return setMsg('error', err.message);

    // If email confirmations are truly OFF, you'll usually get a session immediately.
    // If confirmations are ON, session may be null and user must confirm.
    await setSessionFromSupabase();

    if (!data?.session) {
      setMsg(
        'success',
        'Account created. If email confirmation is enabled, check your inbox to confirm before signing in.'
      );
      mode = 'login';
      rerender();
      return;
    }

    onAuthed?.();
  };

  const rerender = () => {
    mount.innerHTML = '';

    const msgBox = (error || success)
      ? el('div', { class: 'panel', style: { marginBottom: '16px' } },
          el('div', { class: 'panel-body' },
            el('div', {
              class: 'badge',
              style: { background: error ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)' }
            }, error || success)
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
          placeholder: 'you@gmail.org',
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
          placeholder: 'First Name',
          oninput: (e) => { state.first_name = e.target.value; }
        })
      ),
      el('div', {},
        el('label', {}, 'Last name'),
        el('input', {
          class: 'input',
          value: state.last_name,
          placeholder: 'Last Name',
          oninput: (e) => { state.last_name = e.target.value; }
        })
      ),
      el('div', {},
        el('label', {}, 'Email'),
        el('input', {
          class: 'input',
          type: 'email',
          value: state.reg_email,
          placeholder: 'you@gmail.org',
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
      el('div', { class: 'panel-header', style: { textAlign: 'center' } },

        // ✅ Logo image
        el('img', {
          src: './components/assets/logo/logo.png',
          alt: 'Camp Catanese Logo',
          class: 'login-logo'
        }),

        // Title text
        el('h3', { class: 'panel-title' },
          'Welcome to the Camp Catanese Scholarship Database'
        ),
      ),

      el('div', { class: 'panel-body' },
        tabs,
        mode === 'login' ? loginForm : registerForm
      )
    );

    const page = el('div', { class: 'page', style: { gridTemplateColumns: '1fr' } },
      el('div', { class: 'panel-stack' }, msgBox, card)
    );

    mount.appendChild(page);
  };

  rerender();
}
