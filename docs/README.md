# Abrigo

> Um espaço digital de acolhimento, reflexão e motivação leve.

## Sobre

O Abrigo oferece um espaço pessoal para respirar, guardar momentos e revisitar
o que faz sentido sem cobrança de produtividade. A experiência funciona
localmente e a sincronização é opcional.

Privacidade, simplicidade, acessibilidade e compatibilidade com dados já
guardados orientam o produto.

## Estado do projeto

Abrigo 2.0 está em desenvolvimento ativo como aplicação Web/PWA mobile-first.

## Experiências atuais

- Lar;
- Momento do Dia;
- Reflexões;
- Intenções;
- Pequenos Cuidados;
- Coisas que fazem bem;
- Meu Dia;
- Retrospectiva e Marcos;
- Cartas e Pesquisa;
- música e atmosfera;
- exportação, backup e sincronização opcional;
- Configurações e Sobre.

Os nomes antigos Diário, Metas, Hábitos, Favoritos, Estatísticas e Conquistas
permanecem somente quando necessários para compatibilidade técnica ou registro
histórico. A antiga experiência de Assistente/IA foi descontinuada e não faz
parte do produto vigente.

## Arquitetura e tecnologia

O frontend usa React, Vite, JavaScript e CSS com arquitetura Module First. A
aplicação é preparada como PWA. O Supabase é usado apenas pela sincronização
opcional, conforme `DATABASE.md` e `SECURITY.md`.

## Documentação

- `ABRIGO_2_SPEC.md` — fonte normativa;
- `ARCHITECTURE.md` — arquitetura;
- `PRODUCT_VISION.md` — visão do produto;
- `ROADMAP.md` — evolução histórica;
- `DESIGN_SYSTEM.md` — experiência e linguagem visual;
- `SECURITY.md` — segurança e privacidade;
- `DATABASE.md` — limites do armazenamento remoto;
- `TESTING.md` — estratégia de testes.

## Segurança e dados

O Abrigo funciona sem sincronização. Quando ela é ativada, a Chave do Abrigo
continua sob controle da pessoa e o servidor recebe somente o hash necessário
para identificação. Backups remotos são consolidados e protegidos segundo as
regras de `SECURITY.md`.

## Filosofia

- simplicidade;
- acolhimento;
- segurança e privacidade;
- acessibilidade;
- autonomia;
- preservação não destrutiva dos dados.

## Licença

Este projeto é privado. Todos os direitos reservados ao autor.

## Autor

**Edryan Lopes** — idealizador e desenvolvedor do Abrigo.

## Projeto

Abrigo 2.0.
