# Teste manual — Sprint 3

Execute sem abrir ou copiar chaves, hashes ou payloads no Console:

1. Confirme que páginas antigas e dados da Sprint 2 continuam presentes.
2. Conecte um Abrigo, recarregue com `Ctrl + R` e confirme a proteção ativa.
3. Faça uma sincronização manual e confirme no Supabase apenas que o payload
   possui formato `abrigo-encrypted`, sem abrir seu conteúdo.
4. Exporte um backup e confirme que o arquivo contém somente o envelope.
5. Restaure com a chave correta e confira os dados.
6. Tente chave errada e arquivo adulterado; nenhum dado local deve mudar.
7. Se houver backup antigo, confirme o aviso e a migração sem novo Abrigo.
8. Troque a chave e confirme que o mesmo Abrigo continua conectado.
9. Confirme que a chave antiga não conecta e a nova restaura.
10. Desconecte este dispositivo e confirme que os dados locais permanecem.
11. Sem Supabase ou offline, altere dados e confirme que a fila permanece.
12. Revise avisos no Dashboard, Diário, Calendário, Favoritos, Metas, Hábitos e
    Configurações em celular e desktop, nos modos claro e escuro.
