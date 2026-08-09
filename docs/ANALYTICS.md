# Métricas anônimas e painel privado

As métricas anônimas ficam habilitadas por padrão com aviso transparente e
opção de desativação imediata em Configurações. Elas são separadas dos Abrigos,
estimam sessões, não pessoas, e deixam de emitir eventos e heartbeat quando o
usuário faz opt-out. Uma pessoa pode abrir mais de uma sessão.

Somente nomes fechados de eventos, páginas genéricas, categoria ampla de tela,
versão do aplicativo e modo de execução (`browser` ou `pwa`) são aceitos. Termos pesquisados, humor, textos, IDs
pessoais, Chave do Abrigo, `keyHash`, backup, ciphertext, URL completa, IP e
User-Agent completo não são enviados.

O token aleatório é criado em memória, transformado em hash e descartado ao
desativar as métricas ou encerrar a página. O heartbeat ocorre aproximadamente
a cada 60 segundos, pausa com a página oculta e considera online apenas uma
sessão vista nos últimos dois minutos.

## Retenção

Presença expira em dez minutos. `cleanup_analytics_presence()` pode ser chamada
periodicamente pelo agendador da plataforma; a aplicação também remove
presenças vencidas durante heartbeats. A limpeza incremental conserva totais
diários agregados por até 365 dias. Não existe evento bruto nem trilha
individual de navegação.

O endpoint administrativo aceita somente intervalos de até 30 dias e retorna
contagens agregadas de sessões estimadas, páginas, erros técnicos seguros,
dispositivos, versões, modo de execução e horários. Grupos entre uma e quatro
sessões são apresentados como “menos de 5”, reduzindo a exposição de grupos
pequenos. O token administrativo permanece apenas no campo durante a consulta,
é apagado em seguida e nunca é persistido.

## Configuração manual

1. Revise e aplique, nesta ordem,
   `20260801120000_anonymous_analytics.sql` e
   `20260802120000_analytics_admin_aggregates.sql` manualmente.
2. Configure somente no servidor: `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY` e `ADMIN_ANALYTICS_TOKEN`.
3. Proteja `/admin/atividade` e `/api/admin-analytics` com o controle de acesso
   da plataforma.
4. Publique somente após revisar permissões, RLS e retenção.
5. Agende `cleanup_analytics_presence()` se houver um cron seguro.

O painel fica desativado sem essas variáveis. Nenhuma deve usar prefixo
`VITE_`. A RPC administrativa pertence somente a `service_role`; `anon` não
pode ler tabelas ou agregados.

As migrations deste repositório são artefatos para revisão: nenhum script de
build, teste ou patch as aplica automaticamente.
