# 🎮 Valorant Lobby Maker

Aplicação para criar e gerenciar lobbies do Valorant com dados armazenados server-side.

## 🚀 Como Rodar

### Desenvolvimento Local

**IMPORTANTE**: O servidor backend (porta 3001) deve estar rodando para o frontend funcionar.

**Opção 1: Rodar tudo junto (Recomendado)**
```bash
npm install
npm run dev:all
```
Este comando inicia automaticamente o servidor backend e o frontend.

**Opção 2: Rodar separadamente**

Terminal 1 - Servidor API (porta 3001):
```bash
npm run dev:server
```

Terminal 2 - Frontend (porta 5173):
```bash
npm run dev
```

**Solução para erro ECONNREFUSED**: Se você ver erros de proxy no Vite, significa que o servidor backend não está rodando. Execute `npm run dev:server` em outro terminal ou use `npm run dev:all`.

### Deploy na Vercel

1. Faça commit e push do código
2. A Vercel detecta automaticamente
3. As APIs em `api/*.ts` viram serverless functions automaticamente
4. Pronto! 🎉

## 📁 Estrutura

- `api/` - Serverless Functions (arrays em memória server-side)
  - `store.ts` - Store com arrays de lobbies e players
  - `lobbies.ts` - API route para lobbies
  - `players.ts` - API route para players
- `src/` - Frontend React
  - `lib/api.ts` - Cliente API
  - `context/LobbiesContext.tsx` - Context para gerenciar lobbies

## ⚠️ Importante

- **Dados são armazenados server-side** em arrays na memória
- Em desenvolvimento: servidor local na porta 3001
- Na Vercel: serverless functions automáticas
- Dados são compartilhados entre todos os usuários

## 📝 Notas

- Os dados ficam em memória (perdidos ao reiniciar)
- Funciona perfeitamente para uso online compartilhado
- Na Vercel, cada instância serverless tem sua própria memória

