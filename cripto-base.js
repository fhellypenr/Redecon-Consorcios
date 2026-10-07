// cripto-base.js — decifra o pacote da base operacional (AES-256-GCM, Web Crypto).
const deB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

export async function decifrarBase(pacote, chaveB64){
  const chave = await crypto.subtle.importKey('raw', deB64(String(chaveB64).trim()), 'AES-GCM', false, ['decrypt']);
  const claro = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(pacote.iv) }, chave, deB64(pacote.dados));
  return JSON.parse(new TextDecoder().decode(claro));
}
