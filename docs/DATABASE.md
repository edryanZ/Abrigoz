# 🗄 Database

> Estrutura planejada para o banco de dados do Abrigo.

---

# Objetivo

Atualize apenas o arquivo docs/DATABASE.md.

Objetivo:

Alinhar a estrutura de dados do Abrigo 2.0 à especificação oficial (ABRIGO_2_SPEC.md).

Requisitos obrigatórios:

- Remover a dependência de autenticação tradicional.
- Remover a tabela users baseada em e-mail/senha.
- Remover campos como:
  - email
  - password_hash
  - provider
  - last_login
- Não utilizar user_id como identidade principal.

Adicionar uma nova abordagem baseada na Chave do Abrigo.

Documentar que:

- Cada Abrigo possui uma Chave do Abrigo única.
- Apenas o hash SHA-256 da chave é armazenado no banco.
- A chave original nunca é armazenada.
- O hash identifica o backup do usuário.
- O Supabase é utilizado apenas para armazenamento e sincronização.
- A criptografia AES-GCM será integrada futuramente.

Atualizar o modelo lógico para utilizar uma entidade semelhante a:

Abrigo
- id
- key_hash
- created_at
- updated_at
- last_sync_at

Dispositivos
- id
- abrigo_id
- device_name
- created_at
- last_sync_at

Os demais módulos (diário, metas, hábitos, calendário etc.) devem se relacionar ao Abrigo, e não a um usuário autenticado.

Manter a organização e o estilo do documento.

Não modificar nenhum outro arquivo.

Ao final, informar:

- tabelas removidas;
- tabelas criadas;
- relacionamentos alterados;
- possíveis impactos futuros.

# Banco de Dados

O banco deverá ser relacional ou NoSQL dependendo da arquitetura escolhida futuramente.

A estrutura abaixo representa o modelo lógico do sistema.

---

# Usuários

Tabela

```
users
```

Campos

```
id
name
email
photo
password_hash
provider
created_at
updated_at
last_login
```

---

# Perfil

Tabela

```
profiles
```

Campos

```
id
user_id
birth_date
bio
theme
language
timezone
avatar
```

Relacionamento

```
1 usuário

↓

1 perfil
```

---

# Diário

Tabela

```
diary_entries
```

Campos

```
id
user_id
title
content
created_at
updated_at
mood_id
location
favorite
```

---

# Humor

Tabela

```
moods
```

Campos

```
id
user_id
mood
note
created_at
```

---

# Hábitos

Tabela

```
habits
```

Campos

```
id
user_id
title
description
color
icon
created_at
```

---

# Registro dos Hábitos

Tabela

```
habit_logs
```

Campos

```
id
habit_id
date
completed
```

---

# Metas

Tabela

```
goals
```

Campos

```
id
user_id
title
description
progress
deadline
status
```

---

# Cartas

Tabela

```
letters
```

Campos

```
id
title
content
category
created_at
```

---

# Carta do Dia

Tabela

```
daily_letters
```

Campos

```
id
user_id
letter_id
opened_at
```

---

# Eventos

Tabela

```
events
```

Campos

```
id
user_id
title
description
date
color
reminder
```

---

# Conquistas

Tabela

```
achievements
```

Campos

```
id
title
description
icon
points
```

---

# Conquistas do Usuário

Tabela

```
user_achievements
```

Campos

```
id
user_id
achievement_id
unlocked_at
```

---

# Estatísticas

Tabela

```
statistics
```

Campos

```
id
user_id
streak
days_using
letters_read
habits_completed
goals_completed
```

---

# Notificações

Tabela

```
notifications
```

Campos

```
id
user_id
title
message
read
created_at
```

---

# Arquivos

Tabela

```
files
```

Campos

```
id
user_id
name
url
type
size
created_at
```

---

# Sessões

Tabela

```
sessions
```

Campos

```
id
user_id
device
ip
last_access
created_at
```

---

# Configurações

Tabela

```
settings
```

Campos

```
id
user_id
theme
language
notifications
privacy
backup
```

---

# Relacionamentos

```
Usuário

├── Perfil

├── Diário

├── Humor

├── Hábitos

├── Metas

├── Eventos

├── Estatísticas

├── Configurações

├── Arquivos

├── Sessões

└── Conquistas
```

---

# Futuras Coleções

Planejadas para versões futuras

- Time Capsules
- Memory Map
- Shared Spaces
- Family
- AI Conversations
- Voice Notes
- Timeline
- Journal Images
- Tags
- Categories

---

# Backup

Todos os registros deverão permitir:

- Exportação
- Importação
- Sincronização
- Recuperação

---

# Versionamento

Alterações no banco deverão manter compatibilidade sempre que possível.

Migrações deverão ser documentadas.

---

# Objetivo Final

O banco de dados do Abrigo deve ser escalável, seguro e preparado para armazenar toda a jornada do usuário durante muitos anos, garantindo integridade, desempenho e facilidade de manutenção.