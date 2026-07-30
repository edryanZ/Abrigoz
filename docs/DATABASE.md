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
