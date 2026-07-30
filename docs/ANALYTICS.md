# Métricas anônimas e painel privado

As métricas são opcionais, desativadas por padrão e separadas dos Abrigos. Elas
estimam sessões, não pessoas. Uma pessoa pode abrir mais de uma sessão.

Somente nomes fechados de eventos, páginas genéricas, categoria ampla de tela e
versão do aplicativo são aceitos. Termos pesquisados, humor, textos, IDs
pessoais, Chave do Abrigo, `keyHash`, backup, ciphertext, URL completa, IP e
User-Agent completo não são enviados.

O token aleatório é criado em memória, transformado em hash e descartado ao
desativar as métricas ou encerrar a página. O heartbeat ocorre aproximadamente
a cada 60 segundos, pausa com a página oculta e considera online apenas uma
sessão vista nos últimos dois minutos.

## Retenção

Presença expira em dez minutos. `cleanup_analytics_presence()` pode ser chamada
periodicamente pelo agendador da plataforma; a aplicação também remove
presenças vencidas durante heartbeats. Totais diários agregados podem ser
mantidos. Não existe trilha individual de navegação.

## Configuração manual

1. Revise e aplique `20260801120000_anonymous_analytics.sql` manualmente.
2. Configure somente no servidor: `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY` e `ADMIN_ANALYTICS_TOKEN`.
3. Proteja `/admin/atividade` e `/api/admin-analytics` com o controle de acesso
   da plataforma.
4. Publique somente após revisar permissões, RLS e retenção.
5. Agende `cleanup_analytics_presence()` se houver um cron seguro.

O painel fica desativado sem essas variáveis. Nenhuma deve usar prefixo
`VITE_`. A RPC administrativa pertence somente a `service_role`; `anon` não
pode ler tabelas ou agregados.
