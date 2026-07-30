# 🎨 Design System

> Guia oficial de identidade visual e componentes do Abrigo.

---

# Objetivo

Atualize apenas o arquivo docs/DESIGN_SYSTEM.md.

Objetivo:

Alinhar o Design System à especificação oficial do ABRIGO_2_SPEC.md.

Não modificar código.

Não alterar nenhum outro arquivo.

Preservar toda a documentação existente e apenas complementar ou atualizar onde houver conflito.

Adicionar as seguintes diretrizes:

## Componentes oficiais reutilizáveis

Os componentes abaixo são a base da interface e devem ser reutilizados sempre que possível:

- GlassCard
- Container
- Section
- Divider
- PageHeader
- Navbar
- Ceu

Nunca duplicar esses componentes.

Antes de criar um novo componente, verificar se um existente pode ser reutilizado.

---

## Princípios da Interface

Toda nova tela deve seguir:

- Mobile First
- Glassmorphism
- Interface limpa
- Pouco ruído visual
- Componentes pequenos
- Espaçamentos consistentes
- Navegação simples
- Acessibilidade

---

## Dashboard

O Dashboard (Lar) deve utilizar GlassCards para organizar informações.

Os widgets devem seguir o mesmo padrão visual.

Evitar cartões com estilos diferentes.

---

## Navbar

Padronizar a Navbar com a estrutura:

🎵        Abrigo        ☰

Onde:

- botão da música à esquerda;
- nome Abrigo centralizado;
- menu à direita.

---

## Responsividade

Toda tela nova deve ser validada em:

- Mobile
- Tablet
- Desktop

Nenhum layout deve ser desenvolvido pensando primeiro em Desktop.

---

## Componentes

Cada componente deve possuir apenas uma responsabilidade.

Evitar componentes muito grandes.

Sempre dividir quando necessário.

---

## Animações

As animações devem ser discretas.

Priorizar:

- Fade
- Scale
- Slide suave

Evitar animações excessivas.

---

## Acessibilidade

Todo componente novo deve possuir:

- aria-label quando necessário;
- foco visível;
- contraste adequado;
- navegação por teclado.

Ao final informar:

- seções adicionadas;
- seções atualizadas;
- conflitos resolvidos.

---

# Princípios

Toda interface do Abrigo deve transmitir:

- Conforto
- Simplicidade
- Elegância
- Organização
- Leveza
- Acolhimento

Evite interfaces poluídas, excesso de cores ou elementos desnecessários.

---

# Identidade Visual

O Abrigo possui uma identidade inspirada em:

- Céu
- Natureza
- Vidro
- Luz
- Calmaria
- Noite
- Amanhecer

---

# Paleta de Cores

## Primária

Responsável pela identidade principal do aplicativo.

```
Primary
```

---

## Secundária

Utilizada em detalhes da interface.

```
Secondary
```

---

## Accent

Usada para destacar ações importantes.

```
Accent
```

---

## Background

Plano de fundo principal.

```
Background
```

---

## Glass

Cor utilizada nos efeitos Glassmorphism.

```
Glass
```

---

## Feedback

Success

Warning

Danger

Info

---

# Tipografia

Família

```
Inter
```

Fallback

```
sans-serif
```

---

# Hierarquia

H1

Título principal

H2

Título de seção

H3

Título de componente

Body

Texto padrão

Caption

Texto auxiliar

Small

Informações secundárias

---

# Espaçamento

Sistema baseado em múltiplos de 4.

```
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
80px
96px
```

---

# Bordas

Radius pequeno

```
8px
```

Radius médio

```
16px
```

Radius grande

```
24px
```

Radius extra

```
32px
```

Radius circular

```
999px
```

---

# Sombras

As sombras devem ser suaves.

Nunca utilizar sombras pesadas.

---

# Glassmorphism

Os componentes principais utilizam efeito Glass.

Características:

- transparência
- blur
- bordas suaves
- brilho discreto

Evitar exageros.

---

# Componentes

Os componentes reutilizáveis ficam em:

```
shared/components
```

Exemplos

- Button
- GlassCard
- Container
- Modal
- Navbar
- Divider
- Loading
- PageHeader
- Section
- Input
- Select

---

# Botões

Todo botão deve possuir:

- estado normal
- hover
- active
- disabled
- loading

---

# Inputs

Todo input deve possuir:

- foco
- erro
- desabilitado
- placeholder

---

# Cards

Todo Card deve seguir:

- padding consistente
- radius padrão
- sombra leve
- fundo glass

---

# Ícones

Todos os ícones devem utilizar uma única biblioteca.

Misturar bibliotecas deve ser evitado.

---

# Responsividade

O desenvolvimento deve seguir a abordagem Mobile First.

Breakpoints

```
Mobile

0–767px
```

```
Tablet

768–1023px
```

```
Desktop

1024px+
```

---

# Layout

Utilizar Containers para limitar largura.

Evitar conteúdo ocupando toda a tela em desktops.

---

# Grid

Preferir Grid e Flexbox.

Evitar posicionamentos absolutos quando não forem necessários.

---

# Espaço entre elementos

Utilizar espaçamento consistente.

Nunca ajustar margens manualmente apenas para resolver um problema visual.

---

# Animações

Todas as animações devem ser suaves.

Exemplos

- Fade
- Scale
- Slide
- Blur
- Opacity

Evitar animações rápidas ou exageradas.

---

# Tempo das animações

Micro interação

```
150ms
```

Normal

```
250ms
```

Complexa

```
350ms
```

---

# Acessibilidade

Toda interface deve possuir:

- contraste adequado
- navegação por teclado
- foco visível
- textos legíveis

---

# Organização

Nenhuma página deve criar componentes exclusivos que poderiam ser reutilizados.

Sempre verificar se o componente pode pertencer ao Shared.

---

# Objetivo Final

O usuário deve reconhecer imediatamente que está utilizando o Abrigo.

Todas as telas devem compartilhar a mesma linguagem visual, transmitindo conforto, simplicidade e organização.