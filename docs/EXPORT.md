# Central de Exportação

A rota `/exportar` é lazy. O usuário seleciona módulos, itens, período, campos
e formato e vê o documento completo antes de confirmar.

Formatos: JSON, JSON AES-GCM protegido por senha, CSV, Markdown, HTML/relatório,
impressão ou PDF do navegador, ICS e ZIP store local. Nenhuma biblioteca pesada
de PDF ou ZIP é usada.

Campos de sincronização, chaves, hashes, dispositivos, ciphertext e
credenciais são removidos. Datas, humor, tags e nomes podem ser ocultados.
Arquivos não são enviados à nuvem e seus nomes não entram nas métricas.
