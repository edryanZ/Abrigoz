# 🏡 Abrigo 2.0 - Architecture

> Última atualização: Julho de 2026

---

# Objetivo

Este documento define a arquitetura oficial do Abrigo.

Toda nova funcionalidade deve seguir estas regras.

O objetivo é manter o projeto organizado, escalável, reutilizável e fácil de manter conforme ele cresce.

---

# Filosofia

O Abrigo utiliza arquitetura baseada em módulos (Module First).

Cada funcionalidade possui seu próprio módulo.

Tudo relacionado a uma funcionalidade permanece dentro dela.

Exemplo:

Calendar

- componentes
- hooks
- serviços
- estilos
- dados
- armazenamento

Nunca espalhar arquivos de uma mesma funcionalidade pelo projeto.

---

# Estrutura principal

```
src/

app/
shared/
modules/
core/
assets/
```

---

# app

Responsável por iniciar o aplicativo.

Contém:

- App
- Main
- Rotas
- Providers
- Configuração global

Nunca colocar regras de negócio nesta pasta.

---

# shared

Contém tudo que pode ser reutilizado por qualquer módulo.

Exemplos:

- Button
- Modal
- Navbar
- GlassCard
- Divider
- Loading
- ErrorBoundary
- Container

Regra:

Se um componente for utilizado por dois ou mais módulos, ele pertence ao Shared.

---

# modules

Cada funcionalidade do Abrigo possui um módulo próprio.

Exemplo:

```
modules/

home/
calendar/
letters/
diary/
mood/
habits/
goals/
statistics/
settings/
security/
music/
profile/
about/
```

Cada módulo poderá possuir apenas o que realmente precisar.

Exemplo:

```
calendar/

components/
hooks/
services/
storage/
styles/
data/
pages/
utils/
```

Não é obrigatório possuir todas essas pastas.

---

# core

Responsável pela infraestrutura do sistema.

Pode conter:

- API
- constantes
- utilidades globais
- hooks globais
- armazenamento global
- helpers

Nunca colocar lógica específica de um módulo.

---

# assets

Todos os arquivos visuais ficam nesta pasta.

Estrutura:

```
assets/

images/
icons/
backgrounds/
audio/
fonts/
animations/
illustrations/
```

---

# CSS

Cada componente deve possuir seu próprio CSS.

Exemplo:

```
Navbar.jsx

Navbar.css
```

Nunca criar arquivos CSS enormes controlando diversas páginas.

---

# Componentes

Cada componente deve possuir apenas uma responsabilidade.

Exemplo correto:

Button

Card

Header

Footer

Modal

Evitar componentes gigantes responsáveis por várias funcionalidades.

---

# Hooks

Hooks servem apenas para reutilizar lógica.

Nunca devem renderizar interface.

Exemplo:

```
useCalendar()

useTheme()

useMusic()

useJourney()
```

---

# Services

Services concentram toda regra de negócio.

Responsabilidades:

- salvar
- editar
- excluir
- buscar
- calcular

Nunca renderizar interface.

---

# Storage

Todo acesso ao armazenamento deve passar por um Storage ou Service.

Nunca acessar localStorage diretamente dentro das páginas.

Exemplo:

Correto:

CalendarStorage

UserStorage

MoodStorage

Errado:

```
localStorage.setItem(...)
```

dentro de componentes React.

---

# Data

Arquivos estáticos.

Exemplos:

- cartas
- músicas
- mensagens
- eventos
- frases

---

# Context

Context deve ser utilizado apenas para estados globais.

Exemplos:

- usuário
- tema
- música
- jornada

Estados locais devem permanecer dentro do módulo.

---

# Nomeação

Componentes

```
Navbar.jsx
GlassCard.jsx
PageHeader.jsx
```

Hooks

```
useCalendar.js
useTheme.js
```

Services

```
CalendarService.js
MoodService.js
```

Storage

```
CalendarStorage.js
```

Context

```
ThemeContext.jsx
UserContext.jsx
```

---

# Organização

Antes de criar qualquer arquivo responder:

> Este arquivo pertence a qual módulo?

Se a resposta for:

Calendar

O arquivo deve ficar dentro de Calendar.

Se a resposta for:

Todo o aplicativo

O arquivo pertence ao Shared ou Core.

---

# Regras

✔ Componentes pequenos

✔ Código reutilizável

✔ Um módulo não deve depender diretamente da estrutura interna de outro módulo

✔ Evitar duplicação

✔ Sempre reutilizar componentes do Shared

✔ Manter nomes padronizados

✔ Separar interface da lógica

---

# Estrutura esperada

```
src/

app/

shared/

modules/

core/

assets/
```

---

# Objetivo Final

Quando o Abrigo possuir centenas de arquivos, qualquer desenvolvedor deverá conseguir localizar qualquer arquivo em poucos segundos apenas conhecendo a funcionalidade relacionada.

A arquitetura deve permitir que o projeto continue crescendo por muitos anos sem perder organização.