Atualize apenas o arquivo docs/PRODUCT_VISION.md.

Objetivo:

Alinhar a visão do produto com a especificação oficial do ABRIGO_2_SPEC.md.

Não modificar código.

Não alterar nenhum outro arquivo.

Manter o propósito, missão, visão, valores, personalidade e pilares já existentes.

Atualizar apenas os pontos relacionados à evolução do produto.

Regras obrigatórias:

- Remover login tradicional como funcionalidade planejada.
- Remover cadastro por e-mail.
- Remover recuperação de senha.
- Remover Google Auth.
- Remover Apple Auth.
- Remover Supabase Auth.

Adicionar e reforçar:

- A Chave do Abrigo como forma exclusiva de conexão e sincronização entre dispositivos.
- O usuário controla sua própria chave.
- A chave original nunca é armazenada no banco.
- A sincronização utiliza apenas o hash SHA-256 da chave para identificação.
- O Supabase é utilizado somente como infraestrutura de banco e sincronização.
- A criptografia AES-GCM será utilizada futuramente para proteger os dados sincronizados.
- O Abrigo deve funcionar mesmo sem sincronização.
- A sincronização é opcional.
- Privacidade e controle do usuário são diferenciais centrais do produto.

Atualizar a seção de objetivos de curto, médio e longo prazo para refletir:

Curto prazo:
- Consolidar a arquitetura Module First.
- Finalizar a Sprint 1.
- Implementar Dashboard, Diário, Navbar e novo Welcome.
- Organizar a sincronização nas Configurações.

Médio prazo:
- Calendário 2.0.
- Favoritos.
- Metas.
- Hábitos.
- Backup seguro.
- Sincronização criptografada.

Longo prazo:
- Inteligência Artificial.
- Galeria.
- Compartilhamento.
- Exportação.
- Aplicativos Android e iOS.

Ao final informar:

- seções atualizadas;
- referências antigas removidas;
- conflitos resolvidos com ABRIGO_2_SPEC.md.