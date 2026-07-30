# Seguranca

As regras normativas estao em ../ABRIGO_2_SPEC.md.

## Chave do Abrigo

A Chave do Abrigo e o unico mecanismo de conexao e sincronizacao entre dispositivos. Nao existem login tradicional, senha, cadastro por e-mail, recuperacao por e-mail, login social ou Supabase Auth.

A chave original e exibida somente ao usuario e nunca e armazenada no banco, registrada em logs, incluída em URLs ou retornada em mensagens de erro. O SHA-256 da chave e usado somente para identificacao. HTTPS, validacao de entrada e mensagens de erro seguras continuam obrigatorios.

## Dados e futuro

A sincronizacao e opcional; o Abrigo funciona localmente sem ela. AES-GCM e o padrao planejado para dados sincronizados e sera preparado na infraestrutura antes de ser integrado aos modulos. Backup, dispositivos e conflito de sincronizacao serao detalhados quando entrarem no roadmap ativo.
