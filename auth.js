// auth.js — módulo de login compartilhado (Redecon Consórcios)
// Usado por index.html, redecon_processos.html e painel-checklist-redecon.html
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  setPersistence, browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDAq_DJ15fYlcSPkzi6DNnfk-1HPzB09pw",
  authDomain: "redecon-processos.firebaseapp.com",
  projectId: "redecon-processos",
  storageBucket: "redecon-processos.firebasestorage.app",
  messagingSenderId: "156637277637",
  appId: "1:156637277637:web:c89642cd37b8a6b5a4afac"
};

export const fbApp = initializeApp(firebaseConfig);
export const auth = getAuth(fbApp);

// Sessão vinculada à aba: fechar a aba/navegador já desloga sozinho
// (em vez do padrão do Firebase, que mantém logado indefinidamente).
setPersistence(auth, browserSessionPersistence).catch(e => console.error('Erro ao configurar persistência de sessão:', e));

// Desconecta sozinho após 30 minutos sem nenhuma interação na página.
const TEMPO_INATIVIDADE_MS = 30 * 60 * 1000;
let _timerInatividade = null;
function _resetTimerInatividade(){
  if(_timerInatividade) clearTimeout(_timerInatividade);
  _timerInatividade = setTimeout(() => {
    signOut(auth).finally(() => {
      alert('Sua sessão foi encerrada por 30 minutos de inatividade. Faça login novamente.');
      location.reload();
    });
  }, TEMPO_INATIVIDADE_MS);
}
function _iniciarMonitorInatividade(){
  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, _resetTimerInatividade, { passive: true });
  });
  _resetTimerInatividade();
}

function injectOverlay(){
  if(document.getElementById('auth-overlay')) return;
  const css = `
    #auth-overlay{position:fixed;inset:0;background:#0e0e13;z-index:99999;display:flex;align-items:center;justify-content:center;font-family:'Segoe UI',system-ui,-apple-system,Arial,sans-serif}
    #auth-overlay .box{background:#17171f;border:1px solid #2a2a35;border-radius:16px;padding:38px 34px;width:320px;box-shadow:0 20px 60px rgba(0,0,0,.5)}
    #auth-overlay .brand{display:flex;align-items:center;gap:10px;margin-bottom:22px}
    #auth-overlay .arc{width:26px;height:26px;border-radius:50%;border:4px solid #f23000;border-left-color:transparent;border-bottom-color:transparent;transform:rotate(-45deg)}
    #auth-overlay .brand b{color:#fff;font-size:16px}
    #auth-overlay label{display:block;font-size:12px;color:#9a9aa4;margin:14px 0 5px;font-weight:600}
    #auth-overlay input{width:100%;padding:10px 12px;border-radius:8px;border:1px solid #33333f;background:#0e0e13;color:#fff;font-size:14px;box-sizing:border-box}
    #auth-overlay input:focus{outline:2px solid #f23000;border-color:#f23000}
    #auth-overlay button{width:100%;margin-top:20px;padding:11px;border:0;border-radius:8px;background:#c73b2e;color:#fff;font-weight:700;font-size:14px;cursor:pointer}
    #auth-overlay button:hover{background:#a92300}
    #auth-overlay .err{color:#ff8a7a;font-size:12.5px;margin-top:12px;min-height:16px}
    #auth-overlay .load{color:#8a8a94;font-size:13px;text-align:center}
    .topbar-user{display:flex;align-items:center;gap:10px;font-size:12.5px;color:#c9c9d2}
    .topbar-user button{background:none;border:1px solid #3a3a46;color:#c9c9d2;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer}
    .topbar-user button:hover{border-color:#f0806c;color:#f0806c}
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
  const div = document.createElement('div');
  div.id = 'auth-overlay';
  div.innerHTML = `<div class="box">
    <div class="brand"><img src="img/logo-redecon-branca.png" alt="Redecon Consórcios" style="height:38px;width:auto;display:block"></div>
    <div id="auth-loading" class="load">Verificando acesso…</div>
    <form id="auth-form" style="display:none">
      <label>E-mail</label>
      <input type="email" id="auth-email" autocomplete="username" required>
      <label>Senha</label>
      <input type="password" id="auth-senha" autocomplete="current-password" required>
      <button type="submit">Entrar</button>
      <div class="err" id="auth-err"></div>
    </form>
  </div>`;
  document.body.appendChild(div);
}

/** Bloqueia a página até haver login. Resolve com o usuário autenticado. */
export function requireAuth(){
  injectOverlay();
  return new Promise((resolve)=>{
    const overlay = document.getElementById('auth-overlay');
    const loading = document.getElementById('auth-loading');
    const form = document.getElementById('auth-form');
    const err = document.getElementById('auth-err');
    let resolved = false;
    onAuthStateChanged(auth, (user)=>{
      if(user){
        overlay.remove();
        _iniciarMonitorInatividade();
        if(!resolved){ resolved = true; resolve(user); }
      } else {
        loading.style.display = 'none';
        form.style.display = 'block';
      }
    });
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      err.textContent = '';
      const email = document.getElementById('auth-email').value.trim();
      const senha = document.getElementById('auth-senha').value;
      try{
        await signInWithEmailAndPassword(auth, email, senha);
      }catch(ex){
        err.textContent = 'E-mail ou senha incorretos.';
      }
    });
  });
}

export function logout(){ signOut(auth).then(()=>location.reload()); }

/** Cria o bloquinho "email + Sair" para colocar na topbar de cada página. */
export function userBadgeHTML(user){
  return `<div class="topbar-user"><span>${user.email}</span><button onclick="window._redeconLogout()">Sair</button></div>`;
}
window._redeconLogout = logout;
