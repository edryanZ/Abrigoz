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

Esta seção será atualizada após as otimizações e a validação final.

## Limitações

Tamanho de bundle não substitui métricas reais de dispositivo e rede. Esta
Sprint mede artefatos reproduzíveis localmente; avaliações de Core Web Vitals
em produção continuam recomendadas depois de uma publicação autorizada.
