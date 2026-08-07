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

## Experiências locais e inteligência do produto

`src/core/intelligence` oferece funções puras de períodos, retrospectiva, mapa
de momentos, memórias e resumos. A pesquisa usa adaptadores e índice
reconstruível em memória. Regras locais podem apoiar recordações e sugestões,
mas não são apresentadas como inteligência artificial nem análise pessoal.

A reformulação emocional mantém os formatos persistidos existentes e adapta a
experiência por services e funções locais. `Momento do Dia` seleciona conteúdo
deterministicamente pela data local. Reflexões, Intenções e Pequenos Cuidados
reutilizam a persistência histórica de Diário, Metas e Hábitos por camadas de
compatibilidade não destrutivas; componentes não migram storage diretamente.

Preferências pessoais elegíveis entram no backup protegido. Índice de
pesquisa, consentimento de métricas e tokens temporários não entram. O modo
privacidade apenas oculta conteúdo na interface.

## Métricas separadas

`AnalyticsService` aceita eventos enumerados e usa `AnalyticsRepository` sem
passar por `SyncService`, fila, backup ou Chave do Abrigo. O endpoint em `api/`
consulta agregados com credenciais server-side e fica desativado sem
configuração.

## Atmosfera e recursos opcionais

A experiência de Assistente/IA da Sprint 5 foi substituída na reformulação
emocional. Não há chat, prompt, contexto de IA ou endpoint externo na
experiência vigente. O histórico dessa decisão permanece registrado no
Roadmap.

`src/core/atmosphere` calcula seis períodos locais, interpolação gradual,
variação diária determinística, fase lunar aproximada e níveis de intensidade.
`Ceu` é uma única instância global e renderiza camadas CSS sem remontar páginas
ou o player. Interações não registram comportamento. Preferências de atmosfera
e personalização passam por services/hooks; foco de leitura reduz elementos
decorativos de forma transitória.

`src/core/memory` concentra cápsulas futuras, momentos de pausa, preferências de
memória e o adapter de “Guardar este momento”. Cápsulas, pausas e personalização
usam schemas locais versionados e entram no backup consolidado. O adapter de
momentos escreve de forma compatível no formato histórico de Favoritos sem que
um módulo importe outro. Sharing, offline e export mantêm regras fora dos
componentes. Exportação permanece em chunk lazy. Não existe módulo Galeria,
asset pessoal ou provedor de IA no produto.

## Espaços, bloqueio e personalização de navegação

`WorkspaceModeService` define Pessoal, Visitante e Demonstração antes dos
providers que consomem dados. O adapter central de Storage direciona os dois
espaços não pessoais para mapas efêmeros, e a troca de espaço remonta os
providers. `SyncService`, SyncStorage, eventos de sync e AnalyticsService
recusam trabalho remoto fora do Pessoal; não se trata apenas de esconder UI.

`DevicePinService` concentra PBKDF2/Web Crypto e a configuração de auto-lock.
React recebe somente operações e estado público, sem acessar storage ou PIN
persistido diretamente. `NavigationPreferencesService` controla simplificação,
módulos ocultos e até três favoritos. `ContentVisibilityService` oferece a
política comum de ocultar/restaurar conteúdo sem apagar o registro original.

Compartilhamento visual usa canvas local e fica em `core/sharing`. Mapas e
constelações usam funções locais em `core/memory`; não usam GPS, localização,
canvas global, IA ou infraestrutura remota.
