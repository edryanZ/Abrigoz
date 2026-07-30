Atualize apenas o arquivo docs/DECISIONS.md.

Objetivo:

Registrar as novas decisões arquiteturais oficiais do Abrigo 2.0.

Não modificar código.

Não alterar nenhum outro arquivo.

Manter todas as ADRs existentes.

Adicionar as seguintes ADRs ao final do documento.

---

ADR-006

Título

Chave do Abrigo como Identidade Principal

Status

Aceita

Contexto

O Abrigo não utilizará autenticação tradicional.

Decisão

A sincronização entre dispositivos será baseada exclusivamente na Chave do Abrigo.

A chave original nunca será armazenada.

Apenas seu hash SHA-256 será utilizado para identificação no banco.

Consequências

- maior privacidade
- menor dependência de autenticação
- sincronização simplificada
- usuário controla sua identidade

---

ADR-007

Título

Comunicação Desacoplada entre Módulos

Status

Aceita

Contexto

O crescimento do projeto exige baixo acoplamento.

Decisão

Nenhum módulo poderá importar diretamente outro módulo.

Toda comunicação ocorrerá através de:

- Services
- Hooks
- Contexts
- EventBus

Consequências

- módulos independentes
- manutenção facilitada
- maior escalabilidade

---

ADR-008

Título

Sincronização Baseada em Eventos

Status

Aceita

Contexto

Os módulos precisam permanecer independentes.

Decisão

Nenhum módulo chamará syncData() diretamente.

Todos utilizarão emitSync().

O fluxo oficial será:

emitSync()

↓

EventBus

↓

SyncQueue

↓

BackupManager

↓

Repository

↓

Supabase

Consequências

- desacoplamento
- filas de sincronização
- melhor tratamento de conflitos

---

ADR-009

Título

Infraestrutura de Criptografia

Status

Aceita

Contexto

A criptografia será implementada futuramente.

Decisão

A infraestrutura será preparada antes da integração aos módulos.

Será utilizado AES-GCM.

A chave será derivada da Chave do Abrigo.

Consequências

- menor impacto futuro
- integração gradual
- maior segurança

Ao final informar:

- ADRs adicionadas;
- impacto arquitetural;
- possíveis documentos que ainda precisam ser atualizados.