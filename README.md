# Redecon Consórcios — sistema interno

Sistema interno da Redecon Consórcios — entrada única com login (Firebase).
Endereço: https://fhellypenr.github.io/Redecon-Consorcios/

| Arquivo | O que é |
|---|---|
| `index.html` | Página inicial: início, pesquisa global, Central Operacional, mensagens prontas, links |
| `base-operacional.enc.json` | **Base de conhecimento cifrada** (AES-256-GCM). Só abre após o login: a chave fica no Firestore (`dados/chave_base`), nunca no repositório |
| `base-segura.js` · `cripto-base.js` | Leitura da chave no Firebase e decifragem da base no navegador |
| `redecon_processos.html` | Acompanhamento de processos (imóvel e veículo) |
| `painel-checklist-redecon.html` | Pré-análise, negativas, perguntas e checklist |
| `simulacao.html` | Simulador de contemplação (grupos da planilha Google Sheets) |
| `auth.js` | Login compartilhado (Firebase Auth, sessão por aba, sai após 30 min parado) |

O "Como Usar Seu Crédito" continua público em https://fhellypenr.github.io/Como-Usar-Seu-Credito-Redecon-HS/ (é enviado aos clientes).

## Regras
- Nunca colocar nome, CPF ou dado de cliente no código: o repositório é público.
- A versão em texto da base e a chave ficam fora do repositório (projeto privado no Claude). Nunca publicar `base-operacional.js` em claro nem a chave.
- Grupos com Fidelidade 4 (1500/900): marcar `fid-nova` em Observações da planilha; colunas Fid1/Fid2/Fid3 = 12/18/24 meses; a Fidelidade 1 (6 meses) já está no código (1500 = 46, 900 = 24); para mudar, escrever `fid1=NN` em Observações.
