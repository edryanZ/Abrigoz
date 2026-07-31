# Banco de dados

O Supabase é usado somente para armazenamento e sincronização opcional. Não
existe Supabase Auth, usuário por e-mail ou senha.

## Tabelas

### `public.abrigos`

- `id uuid`, chave primária;
- `key_hash text`, único, SHA-256 hexadecimal da Chave do Abrigo;
- `created_at`, `updated_at`, `last_sync_at`.

A Chave original e chaves AES nunca são armazenadas.

### `public.abrigo_backups`

- `id uuid`, chave primária;
- `abrigo_id uuid`, referência para `public.abrigos`;
- `version integer`;
- `payload jsonb`;
- `created_at`, `updated_at`.

Após a Sprint 3, novos payloads são envelopes AES-GCM versionados. Payloads
plaintext versão 1 anteriores permanecem legíveis apenas até uma migração
confirmada pelo dispositivo.

### `public.abrigo_devices`

- `id uuid`, chave primária;
- `abrigo_id uuid`, referência para `public.abrigos`;
- `device_id text`;
- `device_name text`;
- `created_at`, `last_sync_at`.

## RPCs

O cliente não acessa tabelas diretamente:

- `create_abrigo`;
- `find_abrigo_by_key_hash`;
- `save_abrigo_backup`;
- `get_abrigo_backup`;
- `register_abrigo_device`;
- `update_abrigo_last_sync`;
- `rotate_abrigo_key`, mantida por compatibilidade;
- `rotate_abrigo_key_with_backup`, adicionada na Sprint 3.

## Rotação protegida

`rotate_abrigo_key_with_backup` recebe os hashes atual e novo e um envelope
`remote-sync`. Na mesma transação, bloqueia o Abrigo atual, valida conflito,
atualiza ou cria o backup e troca apenas o `key_hash`. IDs, dispositivos e
relacionamentos são preservados.

A migration fica em:

```text
supabase/migrations/20260731180000_rotate_abrigo_key_with_backup.sql
```

Ela não é aplicada automaticamente pelos patches. Deve ser revisada e aplicada
manualmente antes de liberar a rotação protegida.

## Permissões

As funções usam `security definer`, `search_path` controlado e acesso concedido
somente ao papel `anon` necessário ao modelo sem autenticação. Tabelas não são
liberadas ao cliente.

## Conteúdo local

Diário, calendário, favoritos, metas, hábitos e demais módulos continuam
armazenados localmente. O servidor recebe um único backup consolidado e
criptografado, sem estrutura individual de tabelas para esses módulos.

## Métricas anônimas

A migration `20260801120000_anonymous_analytics.sql`, não aplicada
automaticamente, cria `analytics_presence`, `analytics_daily` e as funções
`analytics_heartbeat`, `record_analytics_event`,
`cleanup_analytics_presence` e `get_analytics_admin_summary`.

As tabelas têm RLS, nenhum `SELECT` público e nenhuma relação com `abrigos`.
Somente as RPCs de escrita mínima são concedidas a `anon`; a consulta
administrativa é restrita a `service_role`. Consulte `ANALYTICS.md`.

A migration incremental
`20260802120000_analytics_admin_aggregates.sql` adiciona somente contagens
agregadas de modo de execução e faixa horária, limita a retenção diária a 365
dias pela rotina de limpeza e mantém o acesso administrativo via
`service_role`. Ela não cria eventos brutos, não altera dados pessoais e
também deve ser aplicada manualmente após revisão.

## Sprint 5

Nenhuma migration foi criada ou aplicada. Assistente, recomendações, céu,
preferências, compartilhamento local, offline e exportação não exigem novas
tabelas. Cápsulas remotas exigiriam ciphertext, token hasheado, expiração e
revogação server-side e permanecem desativadas. Não existe tabela, bucket ou
migration de Galeria.
