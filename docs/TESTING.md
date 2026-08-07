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
