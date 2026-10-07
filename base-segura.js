// base-segura.js — carrega a base operacional da Redecon Consórcios só depois do login.
// O conteúdo publicado (base-operacional.enc.json) é cifrado com AES-256-GCM.
// A chave NÃO fica neste repositório: fica no Firestore (dados/chave_base),
// que só pode ser lido por usuário logado.
import { fbApp } from './auth.js';
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { decifrarBase } from './cripto-base.js';

const db = getFirestore(fbApp);
const refChave = () => doc(db, 'dados', 'chave_base');

export async function lerChave(){
  const snap = await getDoc(refChave());
  return snap.exists() ? (snap.data().k || null) : null;
}

export async function salvarChave(k){
  await setDoc(refChave(), { k, atualizado: new Date().toISOString() });
}

export async function carregarBase(chave){
  const r = await fetch('base-operacional.enc.json', { cache: 'no-store' });
  if(!r.ok) throw new Error('arquivo da base indisponível (' + r.status + ')');
  return decifrarBase(await r.json(), chave);
}
