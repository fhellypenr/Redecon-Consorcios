/* conferencia-final.js — tela de "Conferência final" antes de gerar um PDF (Termo de Opção e DPS).
   Lê o próprio formulário (#form): cada .sec visível vira um bloco; cada .field visível e preenchido vira uma linha
   (rótulo + valor). Campos vazios ficam de fora. Uso:
     const ok = await conferenciaFinal({ titulo:'Termo de Opção', avisos:[...], botao:'Gerar PDF' });
   Devolve true se o usuário confirmar. */
(function(){
  const css = ''
    + '.cf-fundo{position:fixed;inset:0;background:rgba(15,15,22,.55);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:28px 14px;overflow:auto}'
    + '.cf-caixa{background:#fff;border-radius:14px;max-width:780px;width:100%;box-shadow:0 18px 50px rgba(0,0,0,.3);font-family:"Segoe UI",system-ui,Arial,sans-serif;color:#1a1a1f}'
    + '.cf-topo{padding:16px 20px 12px;border-bottom:1px solid #e3e3e8}'
    + '.cf-topo h3{font-size:17px;margin:0 0 3px}'
    + '.cf-topo p{font-size:12.5px;color:#6b6b74;margin:0;line-height:1.45}'
    + '.cf-corpo{padding:14px 20px;max-height:calc(100vh - 220px);overflow:auto}'
    + '.cf-av{background:#fff6e5;border:1px solid #f1d58b;color:#6b4a00;border-radius:10px;padding:10px 13px;font-size:12.5px;line-height:1.55;margin-bottom:12px}'
    + '.cf-av b{display:block;margin-bottom:2px}'
    + '.cf-ok{background:#eef8f1;border:1px solid #bfe3cb;color:#1d5e33;border-radius:10px;padding:9px 13px;font-size:12.5px;margin-bottom:12px}'
    + '.cf-sec{margin-bottom:12px;border:1px solid #e3e3e8;border-radius:10px;overflow:hidden}'
    + '.cf-sec h4{margin:0;background:#15151d;color:#fff;font-size:11.5px;letter-spacing:.5px;text-transform:uppercase;padding:7px 12px}'
    + '.cf-sub{font-size:11px;font-weight:800;color:#c73b2e;text-transform:uppercase;letter-spacing:.4px;padding:8px 12px 2px}'
    + '.cf-l{display:grid;grid-template-columns:minmax(150px,38%) 1fr;gap:10px;padding:5px 12px;font-size:13px;border-top:1px solid #f1f1f4;line-height:1.4}'
    + '.cf-l:first-of-type{border-top:0}'
    + '.cf-l span{color:#6b6b74}'
    + '.cf-l b{font-weight:600;white-space:pre-wrap;overflow-wrap:anywhere}'
    + '.cf-l.sim b{color:#a12}'
    + '.cf-pe{padding:12px 20px;border-top:1px solid #e3e3e8;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}'
    + '.cf-pe button{border:0;border-radius:8px;padding:10px 16px;font-size:13.5px;font-weight:600;cursor:pointer;font-family:inherit}'
    + '.cf-volta{background:#fff;border:1px solid #e3e3e8 !important;color:#1a1a1f}'
    + '.cf-vai{background:#c73b2e;color:#fff}'
    + '.cf-vai:hover{background:#a92300}'
    + '@media(max-width:600px){.cf-l{grid-template-columns:1fr;gap:1px}}'
    + '@media print{.cf-fundo{display:none !important}}';
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const E = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const visivel = el => !!(el && el.offsetParent !== null && !el.closest('.hide'));
  const limpa = s => String(s || '').replace(/\s*[—–-]\s*(se houver|opcional)\s*$/i, '').replace(/\s*\((obrigatório[^)]*|opcional)\)\s*/gi, ' ').replace(/\s+/g, ' ').trim();

  function valorDe(field){
    const chipOn = field.querySelector('.chips .chip.on');
    if(chipOn) return chipOn.textContent.trim();
    const sel = field.querySelector('select');
    if(sel) return sel.value ? sel.options[sel.selectedIndex].text.trim() : '';
    const inp = field.querySelector('input:not([type=checkbox]):not([type=radio]), textarea');
    if(!inp) return '';
    let v = inp.value.trim();
    if(inp.type === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(v)){ const p = v.split('-'); v = p[2] + '/' + p[1] + '/' + p[0]; }
    return v;
  }

  function resumo(){
    let h = '';
    document.querySelectorAll('#form .sec').forEach(sec => {
      if(!visivel(sec)) return;
      const titulo = (sec.querySelector('h2') || {}).innerText || '';
      let linhas = '', subPend = '';
      sec.querySelectorAll('.sub, .field, .perg, .calc').forEach(el => {
        if(!visivel(el)) return;
        if(el.classList.contains('calc')){ const t = el.innerText.trim(); if(t) linhas += '<div class="cf-l"><span>Preenchido automaticamente</span><b>' + E(t) + '</b></div>'; return; }
        if(el.classList.contains('sub')){ subPend = el.innerText.trim(); return; }
        if(el.classList.contains('perg')){
          const p = el.querySelector('p'), on = el.querySelector('.chips .chip.on');
          const resp = on ? on.textContent.trim() : '— sem resposta —';
          linhas += '<div class="cf-l' + (on && on.dataset.v === 'sim' && !/^1\)/.test(p.innerText) ? ' sim' : '') + '"><span>' + E(p.innerText.trim()) + '</span><b>' + E(resp) + '</b></div>';
          return;
        }
        if(el.closest('.perg') && !el.classList.contains('perg')){
          const v = valorDe(el); if(!v) return;
          linhas += '<div class="cf-l"><span>↳ ' + E(limpa((el.querySelector('label') || {}).innerText)) + '</span><b>' + E(v) + '</b></div>';
          return;
        }
        const v = valorDe(el); if(!v) return;
        const lab = limpa((el.querySelector('label') || {}).innerText);
        if(!lab) return;
        if(subPend){ linhas += '<div class="cf-sub">' + E(subPend) + '</div>'; subPend = ''; }
        linhas += '<div class="cf-l"><span>' + E(lab) + '</span><b>' + E(v) + '</b></div>';
      });
      if(linhas) h += '<div class="cf-sec"><h4>' + E(titulo) + '</h4>' + linhas + '</div>';
    });
    return h;
  }

  window.conferenciaFinal = function(op){
    op = op || {};
    return new Promise(resolve => {
      const av = op.avisos || [];
      const fundo = document.createElement('div');
      fundo.className = 'cf-fundo';
      fundo.innerHTML = '<div class="cf-caixa" role="dialog" aria-modal="true" aria-label="Conferência final">'
        + '<div class="cf-topo"><h3>📋 Conferência final — ' + E(op.titulo || '') + '</h3><p>Confira tudo com calma antes de gerar. Campos em branco não aparecem aqui.</p></div>'
        + '<div class="cf-corpo">'
        + (av.length ? '<div class="cf-av"><b>⚠️ Ainda há ' + av.length + ' ponto(s) para conferir</b>' + av.map(x => '• ' + E(x)).join('<br>') + '</div>'
                     : '<div class="cf-ok">✅ Nenhuma pendência encontrada pelas conferências automáticas.</div>')
        + resumo()
        + '</div>'
        + '<div class="cf-pe"><button class="cf-volta" type="button">← Voltar e corrigir</button><button class="cf-vai" type="button">' + E(op.botao || '✓ Conferi, gerar PDF') + '</button></div>'
        + '</div>';
      const fechar = ok => { document.removeEventListener('keydown', tecla); fundo.remove(); resolve(ok); };
      const tecla = e => { if(e.key === 'Escape') fechar(false); };
      fundo.querySelector('.cf-volta').onclick = () => fechar(false);
      fundo.querySelector('.cf-vai').onclick = () => fechar(true);
      fundo.addEventListener('click', e => { if(e.target === fundo) fechar(false); });
      document.addEventListener('keydown', tecla);
      document.body.appendChild(fundo);
      fundo.querySelector('.cf-vai').focus();
    });
  };
})();
