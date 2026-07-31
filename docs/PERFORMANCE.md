# Performance do Abrigo

## Como medir

Execute, na ordem:

```bash
npm run build
npm run analyze:bundle
npm run check:budgets
```

O analisador usa somente módulos nativos do Node. Ele identifica o arquivo de
entrada pelo `dist/index.html`, mede os arquivos JavaScript e CSS em tamanho
bruto e gzip, classifica chunks de entrada, rota, vendor e compartilhados e lê
o manifesto embutido no service worker para estimar o precache.

## Situação inicial da Sprint 6

Medição realizada sobre `origin/codex-sprint-5` (`982b12e`):

- `dist`: 7.568.425 bytes;
- entrada principal: 256.438 bytes brutos e 83,20 KiB gzip;
- chunk do Supabase: 104.224 bytes brutos e 25,27 KiB gzip;
- precache informado pelo build: 78 entradas e 1.232,02 KiB;
- 32 testes existentes aprovados.

## Gargalos confirmados

- `MusicContext` criava `Audio` na montagem global, carregava preferências duas
  vezes e recriava listeners de áudio e Media Session em cada renderização.
- a posição da faixa era gravada em todo evento `timeupdate`;
- o temporizador consultava o relógio a cada segundo;
- o analytics era montado globalmente mesmo sem consentimento, embora o
  repositório remoto já fosse importado de forma dinâmica;
- o Workbox de produção era gerado explicitamente em modo de desenvolvimento;
- o orçamento anterior de 400 KiB não detectaria uma regressão relevante do
  bundle principal.

## Alterações e números finais

- entrada principal: 252.850 bytes (246,92 KiB) brutos e 78,57 KiB gzip;
- redução da entrada: 1,40% bruto e 5,57% gzip;
- JavaScript total: 675,39 KiB bruto e 214,76 KiB gzip;
- CSS total: 72,84 KiB bruto e 22,70 KiB gzip;
- Supabase: 101,78 KiB bruto e 24,46 KiB gzip, em chunk tardio;
- precache: 79 entradas, 75 únicas e 1.242,04 KiB;
- `dist`: 84 arquivos e 7.400,80 KiB.

O `JourneyProvider` passou a existir somente na rota Lar. Analytics e seu
repositório remoto são importados somente depois do consentimento. O player
cria `Audio` sob demanda, conserva listeners, grava posição no máximo a cada
cinco segundos e encerra corretamente timers e Media Session. Céu e tema
pausam trabalho desnecessário; o service worker exclui MP3 do precache, limpa
caches antigos e aguarda confirmação para atualizar.

A meta desejada de 10% e de 230 KiB bruto não foi atingida. A estrutura global
restante contém tema, céu, roteamento, Navbar, player e avisos essenciais.
Retirá-los da entrada atrasaria a primeira interface ou criaria downloads
imediatos equivalentes. Não foi usado `manualChunks` artificial nem houve
fragmentação de React apenas para aparentar redução.

O modo de produção do gerador do Workbox foi testado com Node 24, mas sua etapa
de minificação não terminou mesmo após tentativas isoladas. Para não tornar o
build instável, o service worker permanece temporariamente sem minificação. O
registro foi alinhado ao fluxo de atualização por confirmação e o precache foi
deduplicado; uma atualização compatível do Workbox deve ser avaliada em Sprint
futura, sem `npm audit fix` automático.

## Limitações

Tamanho de bundle não substitui métricas reais de dispositivo e rede. Esta
Sprint mede artefatos reproduzíveis localmente; avaliações de Core Web Vitals
em produção continuam recomendadas depois de uma publicação autorizada.

O painel administrativo acrescenta um chunk de rota de 5,10 KiB bruto, que não
é baixado na abertura comum. A pequena alta final em relação ao melhor ponto
intermediário da Sprint corresponde ao painel e aos controles de analytics
solicitados, mantendo-os fora da entrada principal sempre que possível.
