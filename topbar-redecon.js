/* topbar-redecon.js — cabeçalho padrão das ferramentas da Redecon (mesmo visual da Central).
   Uso: logo depois de <body>, incluir
     <script src="topbar-redecon.js" data-pagina="checklist" data-titulo="Painel de Checklist"></script>
   data-pagina: central | processos | checklist | simulacoes (marca o atalho ativo)
   O e-mail do usuário + botão Sair vão em #rc-userbox (preenchido pela página depois do login). */
(function(){
  var s = document.currentScript;
  var pagina = (s && s.dataset.pagina) || '';
  var titulo = (s && s.dataset.titulo) || '';

  var css = ''
    + '.rc-topbar{height:60px;background:#111216;color:#fff;display:flex;align-items:center;gap:18px;padding:0 22px;'
    +   'border-bottom:1px solid #27282f;position:sticky;top:0;z-index:200;font-family:"Segoe UI",Inter,system-ui,-apple-system,Arial,sans-serif;box-sizing:border-box}'
    + '.rc-topbar *{box-sizing:border-box}'
    + '.rc-brand{display:flex;align-items:center;gap:12px;min-width:0;text-decoration:none;color:#fff;flex:0 0 auto}'
    + '.rc-logo{height:32px;width:auto;display:block}'
    + '.rc-sep{width:1px;height:24px;background:#3a3b44}'
    + '.rc-titulo{font-size:15px;font-weight:700;letter-spacing:.1px;white-space:nowrap}'
    + '.rc-nav{display:flex;align-items:center;gap:4px;margin-left:auto;overflow-x:auto;scrollbar-width:none}'
    + '.rc-nav::-webkit-scrollbar{display:none}'
    + '.rc-nav a{color:#c9cad1;text-decoration:none;font-size:13px;font-weight:600;padding:8px 12px;border-radius:8px;white-space:nowrap;transition:background .15s,color .15s}'
    + '.rc-nav a:hover{background:rgba(255,255,255,.08);color:#fff}'
    + '.rc-nav a.on{color:#fff;background:rgba(239,59,22,.16);box-shadow:inset 0 -2px 0 #ef3b16}'
    + '#rc-userbox{flex:0 0 auto}'
    + '#rc-userbox .topbar-user{display:flex;align-items:center;gap:10px;font-size:12.5px;color:#c9cad1;white-space:nowrap}'
    + '#rc-userbox .topbar-user button{background:none;border:1px solid #3a3b44;color:#c9cad1;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;font-family:inherit}'
    + '#rc-userbox .topbar-user button:hover{border-color:#ef3b16;color:#fff}'
    + '@media(max-width:900px){.rc-topbar{padding:0 12px;gap:10px}.rc-logo{height:26px}.rc-sep,.rc-titulo{display:none}.rc-nav a{padding:7px 9px;font-size:12px}#rc-userbox .topbar-user span{display:none}}'
    + '@media(max-width:520px){.rc-topbar{gap:6px;padding:0 10px}.rc-logo{height:22px}.rc-nav{gap:0}.rc-nav a{padding:6px 6px;font-size:11.5px}#rc-userbox .topbar-user button{padding:3px 7px;font-size:11px}}'
    + '@media print{.rc-topbar{display:none!important}}';

  var links = [
    ['central', 'index.html', 'Central'],
    ['processos', 'redecon_processos.html', 'Processos'],
    ['checklist', 'painel-checklist-redecon.html', 'Checklist'],
    ['simulacoes', 'simulacao.html', 'Simulações']
  ];
  var nav = links.map(function(l){
    return '<a href="' + l[1] + '"' + (l[0] === pagina ? ' class="on" aria-current="page"' : '') + '>' + l[2] + '</a>';
  }).join('');

  var html = '<header class="rc-topbar">'
    + '<a class="rc-brand" href="index.html" title="Voltar à Central">'
    +   '<img class="rc-logo" src="img/logo-redecon-branca.png" alt="Redecon Consórcios">'
    +   (titulo ? '<span class="rc-sep" aria-hidden="true"></span><span class="rc-titulo">' + titulo + '</span>' : '')
    + '</a>'
    + '<nav class="rc-nav" aria-label="Ferramentas">' + nav + '</nav>'
    + '<div id="rc-userbox"></div>'
    + '</header>';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
  document.body.insertAdjacentHTML('afterbegin', html);
})();
