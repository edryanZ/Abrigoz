# Arquitetura

`ABRIGO_2_SPEC.md` é a fonte normativa.

O projeto é organizado em `app`, `shared`, `modules`, `core` e `assets`.
Módulos não dependem diretamente de outros módulos. Persistência e regras de
negócio ficam em Storage, Services ou Repository; componentes React coordenam
somente a interface.

## Proteção de dados

`src/core/crypto` concentra:

- Base64URL;
- derivação HKDF-SHA-256;
- AES-GCM e envelopes versionados;
- persistência isolada de `CryptoKey` não extraível em IndexedDB.

`BackupManager` coleta, valida, criptografa e restaura backups de forma
transacional. `RemoteBackupMigration` converte payloads remotos legados de
forma idempotente. `SyncService` é o único coordenador que pode obter material
criptográfico, gerar envelopes e entregá-los ao Repository.

O fluxo remoto é:

```text
emitSync → EventBus → SyncQueue → SyncService
→ BackupManager → CryptoService → AbrigoRepository → RPC
```

O Repository recebe apenas hashes de identificação e envelopes opacos. A fila
contém somente módulo, ação, ID do registro, horário, estado e tentativas.

Componentes não acessam `localStorage`, IndexedDB, Supabase ou `CryptoKey`
diretamente. O aviso compartilhado `PrivacyNotice` traduz o estado seguro
publicado por `SyncService` sem expor detalhes internos.

## Inteligência local

`src/core/intelligence` oferece funções puras de períodos, estatísticas, mapa
de momentos, Hoje, memórias e resumos. A pesquisa usa adaptadores e índice
reconstruível em memória. Conquistas e Companheiro usam regras versionadas e
fatos locais. Não existe IA externa nesta Sprint.

Preferências pessoais elegíveis entram no backup protegido. Índice de
pesquisa, consentimento de métricas e tokens temporários não entram. O modo
privacidade apenas oculta conteúdo na interface.

## Métricas separadas

`AnalyticsService` aceita eventos enumerados e usa `AnalyticsRepository` sem
passar por `SyncService`, fila, backup ou Chave do Abrigo. O endpoint em `api/`
consulta agregados com credenciais server-side e fica desativado sem
configuração.
