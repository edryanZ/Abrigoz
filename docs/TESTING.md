# Testing

## Objetivo

Validar o Abrigo antes de cada publicação sem perder compatibilidade com dados
e experiências existentes. Testes novos devem confirmar comportamento, não
somente a presença de textos no código.

## Testes automatizados

Executar antes de uma entrega:

```bash
npm run test
npm run lint
npm run build
npm run check:budgets
git diff --check
```

## Checklist funcional atual

- Lar funciona sem aparência de dashboard de produtividade;
- Momento do Dia permanece igual na mesma data local e muda no dia seguinte;
- Reflexões, Intenções, Pequenos Cuidados e Coisas que fazem bem preservam os
  formatos históricos;
- Meu Dia, Cartas, Pesquisa e Retrospectiva carregam sem erro;
- Configurações, música, tema, céu, exportação e PWA continuam funcionais;
- Splash aparece apenas na inicialização da aplicação, sem virar rota;
- céu evolui pela hora local sem reload e mantém variação diária determinística;
- Modo Só Ficar, Meu Abrigo e Cápsulas funcionam sem rede;
- cápsulas continuam seladas na UI antes da data local e podem ser excluídas;
- memórias podem ser desativadas ou ocultadas individualmente;
- sincronização é opcional e o modo somente local continua utilizável;
- redirects legados levam às experiências atuais;
- não existe runtime do antigo Assistente/IA.

## Compatibilidade de dados

Testar com registros de versões anteriores para garantir que mudanças de
nomenclatura não apaguem nem renomeiem storage keys. Backups antigos aceitos
pelo formato de compatibilidade devem ser restaurados e validados antes de
qualquer gravação definitiva.

O histórico legado do antigo Assistente, quando presente após uso antigo ou
restauração compatível, deve poder ser apagado voluntariamente sem remover os
demais dados.

## Momento do Dia

Cobrir pelo menos:

- mesma data local produz o mesmo conteúdo;
- dia seguinte produz conteúdo diferente;
- virada de mês;
- virada de ano;
- seleção baseada em calendário local, sem `toISOString()` para definir o dia.

## Rotas de compatibilidade

Validar redirects para:

- `/assistente`;
- `/diario`;
- `/metas`;
- `/habitos`;
- `/favoritos`;
- `/estatisticas`;
- `/conquistas`;
- `/calendario`;
- `/home`.

## Acessibilidade

Validar manualmente e, quando possível, automaticamente:

- Tab e Shift+Tab;
- foco visível em botões, links, inputs, selects e textareas;
- drawer fechado da Navbar fora da ordem de tabulação;
- Escape fecha o drawer e devolve foco ao botão de abertura;
- labels associados aos campos;
- botões somente com ícone possuem nome acessível;
- contraste em tema claro e escuro;
- `prefers-reduced-motion: reduce` reduz movimento decorativo.
- meteoros, fauna atravessando a tela, parallax e abertura animada de envelopes
  são removidos ou simplificados em movimento reduzido.

## Atmosfera e privacidade

- validar os seis períodos e transições intermediárias usando datas locais;
- validar seed diário, fase lunar e níveis de intensidade como funções puras;
- confirmar uma única instância global de `Ceu` durante navegação;
- confirmar ausência de fetch de clima, geolocalização e analytics de interação;
- verificar que leitura e formulários recebem atmosfera reduzida;
- confirmar que preferências antigas de céu continuam válidas.

## Memória

- validar criação, selagem por data local, liberação e exclusão de cápsula;
- validar entrada das novas chaves no backup consolidado;
- validar seleção determinística de lembrança e “não mostrar novamente”;
- confirmar que “Hoje não quero escrever” não persiste registro;
- confirmar integração “Guardar este momento” sem import direto entre módulos.

## Responsividade

Validar pelo menos:

- 360px e 412px;
- 768px e 1024px;
- 1280px e 1920px.

Observar Navbar, Lar, Momento do Dia, Welcome, Reflexões e Configurações para
overflow horizontal, textos longos e alvos de toque.

## Navegadores e PWA

Testar versões suportadas de Chrome, Edge, Firefox e Safari. Na PWA, verificar
instalação, ícones, inicialização, funcionamento offline e atualização
confirmada.

## Performance e console

- sem erros ou warnings relevantes no console;
- sem imports quebrados ou requests inesperados;
- lazy loading preservado;
- budgets do bundle aprovados;
- nenhum request de IA na experiência atual.

## Registro de bugs

Todo bug deve registrar descrição, passos para reproduzir, resultado esperado,
resultado encontrado, versão e navegador.

## Sprint 8

Além do checklist anterior, validar:

- PIN não aparece em texto puro no storage; PIN correto/incorreto, troca,
  desativação e auto-lock funcionam por teclado;
- Visitante/Demo não carregam dados pessoais e bloqueiam sync/analytics no
  core; encerrar descarta o estado efêmero;
- texto pequeno/padrão/grande, alto contraste, fonte de leitura, reduced motion
  e zoom permanecem legíveis em 360×800, 412×915, 768×1024 e 1366×768;
- shortcuts PWA são no máximo quatro; instalação não insiste após “Agora não”;
- exportação seletiva exclui campos internos; import preview mostra categorias
  e restauração nunca acontece sem confirmação;
- filtros temporais, indicadores do Meu Dia, datas especiais e “Este dia,
  outro ano” respeitam datas locais, preferências e itens ocultos;
- mapa/constelação não mostram ranking, desempenho ou relação 1:1 entre
  memória e estrela;
- rituais não persistem “Só pensar nisso”; cartão visual não recebe nome,
  localização ou identificadores sem escolha explícita;
- simplificação não apaga dados, favoritos ficam limitados a três, Ctrl+K não
  captura inputs/editores, Escape fecha a Pesquisa aberta pelo atalho e
  conteúdos ocultos podem ser restaurados;
- Novidades é local/versionada e a Navbar não ganha uma entrada principal para
  cada recurso novo.
