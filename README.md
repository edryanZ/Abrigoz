# 🌿 Abrigo 2.0

> Um espaço digital de acolhimento, reflexão e motivação leve.

O Abrigo é um aplicativo pessoal para desacelerar, encontrar pequenas palavras
de conforto e guardar aquilo que faz bem. Ele une reflexões opcionais, cartas,
memórias, música e uma atmosfera calma sem transformar a vida em uma lista de
tarefas.

O projeto foi criado por **Edryan Lopes**, idealizador e desenvolvedor do
Abrigo, com foco em simplicidade, privacidade e acolhimento.

## Experiências

- Lar calma, com humor opcional e poucos convites;
- Momento do Dia local, sem IA ou envio de conteúdo;
- Reflexões com resposta opcional;
- Cartas pessoais;
- Coisas que fazem bem;
- Intenções e Pequenos Cuidados sem cobrança;
- Meu Dia para quem quiser usar o calendário;
- Retrospectiva e Marcos sem gamificação de produtividade;
- céu dinâmico e música opcional;
- Atmosfera 2.0 com variação local, Modo Só Ficar e personalização em Meu Abrigo;
- cápsulas para o futuro e memórias locais controláveis;
- pesquisa, exportação, backup e sincronização opcional protegida.
- PIN local opcional e espaços Pessoal, Visitante e Demonstração isolados;
- ajustes de texto, alto contraste e leitura confortável;
- busca temporal, datas importantes e memórias simbólicas sem gamificação;
- simplificação da navegação, até três favoritos e Ctrl+K para Pesquisa.

O Abrigo funciona localmente e não exige sincronização nem preenchimento de
informações pessoais para ser útil.

## Tecnologias

- React;
- Vite;
- React Router;
- CSS;
- PWA;
- Web Crypto API;
- armazenamento local e IndexedDB isolados pelo core;
- Supabase somente para sincronização opcional e métricas anônimas transparentes com opt-out.

## Especificação oficial

`ABRIGO_2_SPEC.md` é a principal fonte de verdade. Toda implementação deve
consultá-lo antes da documentação complementar. Em caso de conflito, ele
prevalece até que os demais documentos sejam atualizados.

## Arquitetura e privacidade

O projeto segue arquitetura Module First. Componentes não acessam diretamente
armazenamento, criptografia ou infraestrutura remota. Dados sincronizados são
enviados somente dentro do backup consolidado e criptografado; a Chave do
Abrigo original nunca é enviada ao Supabase.

Consulte:

- `ABRIGO_2_SPEC.md`;
- `docs/ARCHITECTURE.md`;
- `docs/SECURITY.md`;
- `docs/DATABASE.md`;
- `docs/DESIGN_SYSTEM.md`;
- `docs/ROADMAP.md`.

## Desenvolvimento

```bash
npm install
npm run dev
```

Validação local:

```bash
npm run test
npm run lint
npm run build
```

## Identidade instalável

Os ícones da PWA ficam em `public/branding`. `abrigo-icon-source.webp` é a
fonte visual; os PNGs derivados cobrem favicon, iOS, manifesto e maskable. O
comando `npm run check:budgets` valida dimensões, peso dos ícones e áudio.

## Histórico

O Roadmap preserva as Sprints anteriores, incluindo experiências que foram
posteriormente substituídas pela reformulação emocional. A mudança de produto
não apaga formatos locais antigos nem reduz as proteções técnicas existentes.

## Licença

Projeto em desenvolvimento.
