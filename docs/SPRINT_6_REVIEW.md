# Revisão geral da Sprint 6

Revisão estática, testes automatizados e execução local sobre
`origin/codex-sprint-5` (`982b12e`). Foram inspecionados 278 arquivos de código,
testes, scripts, migrations e documentação, sem abrir dados pessoais ou
arquivos de ambiente.

## Matriz de regressão

| Área | Cenário | Resultado | Problema | Gravidade | Correção e teste | Risco restante |
|---|---|---|---|---|---|---|
| Entrada | abertura local sem serviços remotos | aprovado | providers e analytics antecipados | médio | Journey por rota e imports tardios; orçamento bruto/gzip | meta de 230 KiB não foi atingida sem prejudicar a interface essencial |
| Player | navegação, troca, pausa, posição e temporizador | aprovado | `Audio`, listeners e gravações excessivas | médio | áudio sob demanda, callbacks estáveis e throttle; testes de ciclo de vida | validar Media Session em aparelhos reais |
| Céu | seis períodos, ponteiro, toque, aba oculta e movimento reduzido | aprovado | RAF podia trabalhar sem utilidade | baixo | pausa por visibilidade/configuração e limiar de movimento; testes permanentes | desempenho visual varia por GPU |
| PWA | precache, áudio, atualização e navegação offline | aprovado com limitação | atualização automática incompatível com aviso | médio | fluxo `prompt`, cache seguro e limpeza; testes de configuração | minificação Workbox em Node 24 não conclui; ver recomendação |
| Armazenamento | bloqueado, cheio, texto simples e JSON corrompido | aprovado | serviços antigos lançavam erro e escrita registrava objeto técnico | médio | camada segura central, defaults e testes de falha | IndexedDB depende do suporte do navegador |
| Tema | mudança de período | aprovado | verificação a cada minuto durante toda a sessão | baixo | timeout apenas no próximo limite; teste sem intervalo | relógio do dispositivo continua sendo a fonte local |
| Analytics | sem consentimento, revogação e falha remota | aprovado | código e presença incompletos | médio | carregamento tardio, pausa oculta e sessão em memória; testes | contagens representam sessões, não pessoas |
| Painel admin | autenticação, intervalos e grupos pequenos | aprovado | retorno mínimo sem proteção de grupos | médio | endpoint agregado, máximo de 30 dias e “menos de 5”; testes | exige configuração e proteção da plataforma |
| Banco analytics | grants, parâmetros e retenção | preparado | faltavam modo, horas e retenção diária | médio | migration incremental validada por teste | migration não aplicada; requer revisão manual |
| Erros | falha de renderização | aprovado | stack era escrita no console | baixo | código fechado `render_failed`, somente com consentimento | erro grave permanece visível na interface local |
| Rotas | lazy loading e rota administrativa oculta | aprovado | nenhum alto/crítico encontrado | melhoria futura | testes de rotas e ausência de Galeria | teste visual completo depende de navegadores reais |
| Backup e exportação | campos internos, consentimento e chaves | aprovado | nenhum alto/crítico encontrado | melhoria futura | regressões existentes preservadas | importação malformada deve continuar sendo testada a cada formato novo |
| Sincronização | indisponibilidade, rotação e persistência | aprovado por regressão | nenhum alto/crítico encontrado | melhoria futura | testes existentes preservados | testes remotos reais dependem de ambiente autorizado |
| Acessibilidade | labels, estados, tabela e mensagens admin | aprovado por inspeção | painel administrativo era pouco descritivo | baixo | labels explícitos, status e tabela rolável | auditoria com leitor de tela permanece recomendada |
| Responsividade | 320–1366 px por regras CSS | aprovado por inspeção | tabela admin precisava contenção | baixo | layout mobile-first e rolagem interna | aparelhos e teclado virtual exigem validação manual |

## Segurança e privacidade

- Analytics começa desativado, aceita somente enums fechados e usa sessão
  aleatória hasheada, não persistente.
- O endpoint administrativo valida credencial no servidor, limita o período,
  retorna somente agregados e nunca devolve hashes ou linhas individuais.
- `service_role` permanece exclusivamente no endpoint; não há segredo
  administrativo no bundle ou armazenamento do navegador.
- Supabase continua opcional para o funcionamento local. Componentes não
  acessam tabelas, cliente remoto ou armazenamento diretamente.
- Backup e exportação excluem consentimento de analytics, estado interno de
  sincronização, chaves de cápsula e credenciais. AES-GCM, HKDF, rotação e
  migrations pessoais não foram alterados.
- Nenhuma migration foi aplicada. A migration incremental de analytics deve ser
  revisada e aplicada manualmente na ordem documentada em `ANALYTICS.md`.

## Pendências e recomendações

Não há problema crítico ou alto conhecido. A limitação média restante é o
Workbox: `mode: "production"` foi testado com Node 24, mas a minificação não
terminou. O build reproduzível conserva temporariamente o gerador sem
minificação; recomenda-se validar uma versão compatível em Sprint própria, sem
atualização automática de dependências.

Também permanecem recomendadas medições de Core Web Vitals, testes físicos de
instalação/atualização PWA, Safari/iOS, leitores de tela e conexão real
instável. Essas verificações exigem navegadores ou infraestrutura publicados e
não justificam alterar silenciosamente o código local aprovado.

## Diagnóstico de dependências

`npm audit` encontrou 10 ocorrências de severidade alta em duas cadeias:

- `brace-expansion`, transitiva de `vite-plugin-pwa`/Workbox, com risco de
  negação de serviço durante processamento de padrões em ferramentas de build;
- `react-router`, com aviso relacionado ao modo RSC, que este SPA não utiliza.

As correções sugeridas pelo npm exigem `--force` e trocas potencialmente
incompatíveis (`vite-plugin-pwa` 1.2 e `react-router-dom` 7.11). Nenhuma
dependência foi alterada: a Sprint proíbe atualização geral e `npm audit fix`.
Recomenda-se revisar versões compatíveis em uma Sprint isolada, repetir toda a
suíte e validar PWA. O primeiro risco afeta principalmente a cadeia local de
build; o segundo não tem caminho RSC ativo na arquitetura atual, mas ambos
permanecem registrados até atualização segura.
