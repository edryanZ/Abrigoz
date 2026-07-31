# Compartilhamento

Somente conteúdo digitado ou selecionado pelo usuário pode ser compartilhado.
A prévia permite ocultar data, humor e tags. Web Share é usado quando
disponível; o fallback copia texto.

Cápsulas locais são arquivos JSON com ciphertext AES-GCM. Cada cápsula recebe
chave e token aleatórios; nenhum deles é persistido. Há validade de uma hora,
um dia, sete dias, trinta dias ou sem prazo com confirmação. Registros locais
permitem expiração, limpeza e revogação.

Compartilhamento remoto está desativado: não há endpoint implantado que garanta
ciphertext-only, expiração, revogação, exclusão e anti-indexação. Nenhuma
migration foi criada ou aplicada.
