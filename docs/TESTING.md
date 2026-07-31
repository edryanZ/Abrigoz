# 🧪 Testing

> Guia oficial de testes do Abrigo.

---

# Objetivo

Garantir que todas as funcionalidades do Abrigo funcionem corretamente antes de serem publicadas.

Todo recurso novo deve ser validado antes do deploy.

---

# Filosofia

O objetivo dos testes não é apenas encontrar erros.

Os testes garantem que funcionalidades antigas continuem funcionando após novas implementações.

---

# Tipos de Testes

O Abrigo poderá utilizar:

- Testes Manuais
- Testes Unitários
- Testes de Componentes
- Testes de Integração
- Testes End-to-End

---

# Testes Manuais

Antes de publicar qualquer versão verificar:

✔ Home

✔ Dashboard

✔ Cartas

✔ Calendário

✔ Configurações

✔ Navegação

✔ Tema

✔ Música

✔ Responsividade

✔ Performance

✔ Console

---

# Testes de Responsividade

Validar sempre:

## Mobile

320px

375px

390px

414px

480px

---

## Tablet

768px

820px

912px

1024px

---

## Desktop

1280px

1366px

1440px

1600px

1920px

---

# Navegadores

Sempre testar:

- Chrome

- Edge

- Firefox

- Safari

---

# PWA

Verificar:

- Instalação

- Ícones

- Splash Screen

- Funcionamento Offline

---

# Performance

Sempre verificar:

- Tempo de carregamento

- Imagens

- Lazy Loading

- Lighthouse

---

# Console

Antes de cada Release:

✔ Sem Errors

✔ Sem Warnings importantes

✔ Sem Imports quebrados

✔ Sem Requests falhando

---

# Acessibilidade

Verificar:

- Navegação por teclado

- Focus

- Contraste

- Leitura dos textos

- Labels

- Botões

---

# Checklist

Antes do Deploy

☐ Projeto compila

☐ Sem erros

☐ Sem warnings importantes

☐ Responsivo

☐ Componentes funcionando

☐ Tema funcionando

☐ Cartas funcionando

☐ Dashboard funcionando

☐ Navegação funcionando

☐ Build funcionando

☐ Deploy funcionando

---

# Testes Futuros

Planejado

- Vitest

- React Testing Library

- Playwright

- Lighthouse CI

---

# Cobertura

Objetivo futuro

Componentes críticos

100%

Serviços

100%

Hooks

100%

Fluxos principais

100%

---

# Bugs

Todo bug deve conter:

Descrição

Passos para reproduzir

Resultado esperado

Resultado encontrado

Versão

Navegador

Sistema operacional

---

# Objetivo Final

Toda nova versão do Abrigo deve ser publicada apenas após passar por uma validação completa de funcionamento, responsividade, acessibilidade e desempenho.

## Validação reproduzível da Sprint 6

Execute, sem alterar dependências:

```bash
npm run test
npm run lint
npm run build
npm run check:budgets
npm run analyze:bundle
npm audit
```

Os testes permanentes cobrem dados antigos e corrompidos, armazenamento
indisponível, player, céu, PWA, privacidade, criptografia, exportação,
sincronização e analytics. A inspeção manual em `npm run preview` deve
complementá-los em navegador real, incluindo cache limpo, offline, instalação,
atualização sob confirmação, rotas diretas, player durante navegação, temas,
redução de movimento e larguras de 320 a 1366 px.

Não use conteúdo pessoal real nos testes. Migrations e endpoints
administrativos são revisados localmente, mas aplicados ou publicados apenas
em procedimento separado e autorizado.
