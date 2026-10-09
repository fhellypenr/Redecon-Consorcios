/* moeda-br.js — padrão único de valores da Redecon: 500.000,00
   (ponto separa milhar, vírgula separa centavos, sempre 2 casas)

   Aceita qualquer forma que costuma ser colada ou digitada e converte certo:
     "500.000,00"  "R$ 500.000,00"  "500000"  "500000,5"  "500000.00"  "500.000"  "500,000.00"
   Todos viram 500000 → exibidos como "500.000,00".

   Uso nas páginas:
     MoedaBR.parse(v)      → número (ou null se não der para ler)
     MoedaBR.fmt(n)        → "500.000,00"
     MoedaBR.normalizar(v) → texto padronizado; se o campo tiver texto livre (ex.: "a combinar"), devolve como está
     MoedaBR.rs(v)         → "R$ 500.000,00" (vazio se não houver valor)
     MoedaBR.parsePct(v) / MoedaBR.fmtPct(n, casas) → percentual (vírgula ou ponto como decimal; nunca milhar)

   Campos com o atributo data-moeda são padronizados sozinhos ao sair do campo e ao colar.
   Campos com data-pct="3" são padronizados como percentual com 3 casas (ex.: 2,795). */
(function(w){
  'use strict';

  function limpar(v){ return String(v == null ? '' : v).replace(/R\$|\s| /gi, ''); }

  function parse(v){
    if(typeof v === 'number') return isFinite(v) ? Math.round(v * 100) / 100 : null;
    var s = limpar(v).replace(/[^\d,.\-]/g, '');
    if(!/\d/.test(s)) return null;
    var neg = s.charAt(0) === '-';
    s = s.replace(/-/g, '');
    var ultVirg = s.lastIndexOf(','), ultPonto = s.lastIndexOf('.');
    if(ultVirg >= 0 && ultPonto > ultVirg){
      /* formato americano: 500,000.00 */
      s = s.replace(/,/g, '');
    } else if(ultVirg >= 0){
      /* formato brasileiro: 500.000,00 (a última vírgula é o decimal) */
      s = s.replace(/\./g, '');
      var p = s.split(',');
      s = p.slice(0, -1).join('') + '.' + p[p.length - 1];
    } else if(ultPonto >= 0){
      /* só pontos: "500.000" / "1.250.000" = milhar; "500000.00" / "1500.5" = decimal */
      var pontos = (s.match(/\./g) || []).length;
      if(pontos > 1 || /\.\d{3}$/.test(s)) s = s.replace(/\./g, '');
    }
    var n = parseFloat(s);
    if(!isFinite(n)) return null;
    n = Math.round(n * 100) / 100;
    return neg ? -n : n;
  }

  function fmt(n){
    n = Number(n);
    if(!isFinite(n)) return '';
    return n.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }

  /* Só mexe no campo se ele tiver apenas número (com R$, pontos, vírgulas, espaços).
     Texto livre é respeitado para não apagar anotação. */
  function soNumero(v){ return /^-?[\d.,]+$/.test(limpar(v)); }

  function normalizar(v){
    var t = String(v == null ? '' : v).trim();
    if(!t) return '';
    if(!soNumero(t)) return t;
    var n = parse(t);
    return n == null ? t : fmt(n);
  }

  function rs(v){
    var t = normalizar(v);
    if(!t) return '';
    return soNumero(t) ? 'R$ ' + t : t;
  }

  function parsePct(v){
    var s = limpar(v).replace('%', '').replace(/[^\d,.\-]/g, '');
    if(!/\d/.test(s)) return null;
    if(s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(s);
    return isFinite(n) ? n : null;
  }

  function fmtPct(n, casas){
    n = Number(n);
    if(!isFinite(n)) return '';
    var c = casas == null ? 2 : casas;
    return n.toLocaleString('pt-BR', {minimumFractionDigits: c, maximumFractionDigits: c});
  }

  function padronizarCampo(el, soInput){
    if(!el || el.disabled || el.readOnly) return;
    var antes = el.value, depois;
    if(el.hasAttribute('data-moeda')) depois = normalizar(antes);
    else if(el.hasAttribute('data-pct')){
      var n = parsePct(antes);
      depois = (antes.trim() === '' || n == null) ? antes : fmtPct(n, parseInt(el.getAttribute('data-pct'), 10) || 2);
    } else return;
    if(depois !== antes){
      el.value = depois;
      el.dispatchEvent(new Event('input', {bubbles: true}));
      /* ao colar o campo continua em edição: só avisa 'input'; o 'change' sai normalmente ao sair do campo */
      if(!soInput) el.dispatchEvent(new Event('change', {bubbles: true}));
    }
  }

  function alvo(e){
    var el = e.target;
    return el && el.matches && el.matches('input[data-moeda],input[data-pct]') ? el : null;
  }
  /* Ao sair do campo */
  document.addEventListener('focusout', function(e){ var el = alvo(e); if(el) padronizarCampo(el); }, true);
  /* Ao colar: padroniza logo depois que o texto entra */
  document.addEventListener('paste', function(e){ var el = alvo(e); if(el) setTimeout(function(){ padronizarCampo(el, true); }, 0); }, true);

  w.MoedaBR = {parse: parse, fmt: fmt, normalizar: normalizar, rs: rs, parsePct: parsePct, fmtPct: fmtPct, padronizarCampo: padronizarCampo};
})(window);
