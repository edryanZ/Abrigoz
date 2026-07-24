# 🤝 Contributing

> Guia oficial para desenvolvimento do Abrigo.

---

# Objetivo

Este documento define as regras para contribuir com o desenvolvimento do Abrigo.

Todo novo código deve seguir estas diretrizes para manter o projeto organizado, consistente e fácil de manter.

---

# Filosofia

O Abrigo prioriza:

- Código simples
- Organização
- Reutilização
- Legibilidade
- Escalabilidade
- Performance
- Acessibilidade

Sempre prefira soluções simples antes de soluções complexas.

---

# Estrutura

O projeto segue arquitetura baseada em módulos.

```
src/

app/
shared/
modules/
core/
assets/
```

Cada funcionalidade deve ficar dentro do seu próprio módulo.

---

# Antes de criar um arquivo

Sempre responda:

"Este arquivo pertence apenas a um módulo ou pode ser reutilizado?"

Se puder ser reutilizado:

➡ Coloque em **shared**

Caso contrário:

➡ Coloque dentro do módulo correspondente.

---

# Componentes

Cada componente deve possuir apenas uma responsabilidade.

✔ Correto

```
Button

Card

Input

Navbar

Modal
```

❌ Evitar

```
HomeCardMegaComponent.jsx
```

Componentes muito grandes devem ser divididos.

---

# Organização dos módulos

Cada módulo pode possuir:

```
components/

pages/

hooks/

services/

storage/

styles/

utils/

data/
```

Nem todas as pastas são obrigatórias.

---

# CSS

Cada componente deve possuir seu próprio CSS.

Exemplo

```
Button.jsx

Button.css
```

Nunca criar arquivos CSS gigantes controlando várias telas.

---

# Hooks

Hooks servem apenas para reutilizar lógica.

Nunca renderizar interface.

Exemplo

```
useTheme()

useCalendar()

useJourney()
```

---

# Services

Toda regra de negócio deve ficar em Services.

Services podem:

- salvar dados
- buscar dados
- atualizar
- excluir
- calcular

Nunca renderizar interface.

---

# Storage

Todo acesso ao armazenamento deve passar por Storage ou Service.

Nunca acessar localStorage diretamente em páginas React.

---

# Context

Context deve ser utilizado apenas para estados globais.

Exemplos

- usuário
- tema
- música
- jornada

Evitar Context para estados locais.

---

# Nomeação

Componentes

```
GlassCard.jsx
```

Hooks

```
useCalendar.js
```

Services

```
CalendarService.js
```

Storage

```
CalendarStorage.js
```

Context

```
UserContext.jsx
```

CSS

```
GlassCard.css
```

---

# Imports

Organizar imports na seguinte ordem:

1.

Bibliotecas

2.

Componentes compartilhados

3.

Componentes locais

4.

Hooks

5.

Services

6.

Utils

7.

CSS

---

# Commits

Utilizar commits pequenos e descritivos.

Exemplos

```
feat(home): adiciona cartão de boas-vindas

fix(calendar): corrige seleção de datas

refactor(shared): reorganiza componentes

docs: atualiza arquitetura

style(button): melhora animações
```

---

# Pull Requests

Cada Pull Request deve:

- resolver apenas um problema
- possuir descrição
- explicar mudanças
- manter compatibilidade

---

# Código

Prioridades

1.

Legibilidade

2.

Organização

3.

Performance

4.

Reutilização

5.

Otimização

Código fácil de entender vale mais do que código extremamente inteligente.

---

# Responsividade

Todo desenvolvimento deve seguir Mobile First.

Sempre validar:

- Mobile
- Tablet
- Desktop

---

# Acessibilidade

Sempre considerar:

- navegação por teclado
- foco visível
- contraste
- textos alternativos
- componentes acessíveis

---

# Dependências

Antes de instalar uma biblioteca responder:

- Resolve um problema real?
- Já existe solução interna?
- É mantida?
- Possui boa documentação?
- Vale o peso adicional?

Evitar dependências desnecessárias.

---

# Refatoração

Ao melhorar um código:

✔ preservar funcionamento

✔ reduzir complexidade

✔ manter compatibilidade

✔ atualizar documentação quando necessário

---

# Documentação

Sempre que criar:

- novo módulo
- nova arquitetura
- novo padrão
- nova funcionalidade importante

Atualizar a documentação correspondente na pasta **docs**.

---

# Regra de Ouro

Antes de escrever código, pergunte:

- Isso pode ser reutilizado?
- Está seguindo o Design System?
- Está seguindo a Arquitetura?
- Está documentado?
- É simples?

Se alguma resposta for "não", reavalie a implementação.

---

# Objetivo Final

O Abrigo deve permanecer organizado mesmo após anos de desenvolvimento.

Qualquer desenvolvedor deve conseguir entender o projeto rapidamente, localizar arquivos com facilidade e implementar novas funcionalidades seguindo um padrão único.