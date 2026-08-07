# Segurança

As regras normativas estão em `../ABRIGO_2_SPEC.md`.

## Modelo de ameaça

A Sprint 3 reduz a exposição do conteúdo armazenado fora do dispositivo. O
servidor recebe somente envelopes criptografados nos backups remotos. Arquivos
de backup novos também são criptografados. HTTPS, validação de entrada,
proteção do dispositivo e guarda responsável da Chave do Abrigo continuam
necessários; criptografia não elimina todos os riscos.

Os dados normais dos módulos continuam legíveis no armazenamento local do
navegador nesta Sprint. O objetivo não é criptografar indiscriminadamente o
estado local.

## Chave do Abrigo

A chave original:

- aparece temporariamente no fluxo de criação ou rotação;
- nunca é enviada ao Supabase;
- nunca é salva em `localStorage`, `sessionStorage`, IndexedDB como texto,
  URLs, logs ou backups;
- gera um SHA-256 usado somente como `keyHash` de identificação.

O conteúdo não usa o `keyHash` como chave AES.

## Derivação e criptografia

A Web Crypto API deriva chaves AES-GCM de 256 bits com HKDF-SHA-256. O salt e
os contextos são públicos e versionados:

- `abrigo:data-encryption:v1`, para sincronização remota;
- `abrigo:backup-export:v1`, para arquivos de backup.

Cada operação usa um IV aleatório novo de 96 bits. O cabeçalho do envelope é
autenticado como `additionalData`. As chaves AES são não extraíveis e têm
somente os usos `encrypt` e `decrypt`.

## Envelope

O formato atual é:

```json
{
  "format": "abrigo-encrypted",
  "version": 1,
  "purpose": "remote-sync",
  "algorithm": "AES-GCM",
  "keyDerivation": "HKDF-SHA-256",
  "iv": "Base64URL",
  "ciphertext": "Base64URL",
  "createdAt": "ISO-8601"
}
```

`purpose` também pode ser `backup-export`. O envelope não contém nomes de
módulos, conteúdo pessoal, chave, hash, dispositivo ou configuração do
Supabase. Versões, finalidades, IVs, Base64URL e tamanhos inválidos são
rejeitados.

## Persistência criptográfica

As duas `CryptoKey` não extraíveis são associadas ao `keyHash` e persistidas em
IndexedDB por uma camada isolada do core. Componentes não acessam IndexedDB nem
recebem `CryptoKey`.

Se o navegador não puder persistir com segurança, as chaves ficam disponíveis
somente durante a sessão atual. Após recarregar, o aplicativo mantém os dados
locais e solicita novamente a Chave do Abrigo antes de sincronizar. Não existe
fallback para chave bruta ou sincronização plaintext.

Ao desconectar, o material associado é removido. Na rotação, o material antigo
só é removido depois da confirmação remota e local.

## Backup e recuperação

Novas exportações contêm somente o envelope `backup-export`. A restauração
descriptografa e valida tudo antes de alterar dados. A aplicação cria um
snapshot em memória e executa rollback se alguma gravação falhar.

Backups plaintext versão 1 continuam aceitos após identificação e confirmação
explícitas. Eles nunca são reenviados ao servidor sem criptografia, e novas
exportações nunca usam o formato plaintext.

## Migração remota

Um backup remoto versão 1 é migrado somente depois que a Chave localizar o
Abrigo, a derivação funcionar e o conteúdo legado passar na validação rígida.
Depois do envio criptografado, o payload é lido novamente, descriptografado e
comparado. Um envelope já protegido não é criptografado novamente.

## Rotação

A RPC `rotate_abrigo_key_with_backup` atualiza `key_hash` e backup
recriptografado na mesma transação. Em falha local após a confirmação, o
cliente chama a mesma RPC no sentido inverso com o envelope anterior. A RPC
antiga permanece por compatibilidade.

## Limitações

- IndexedDB e persistência de `CryptoKey` variam entre navegadores e modos
  privados.
- Dados locais normais ainda não são criptografados.
- Quem possuir a Chave do Abrigo e acesso ao serviço poderá abrir o conteúdo
  protegido; a chave deve ser guardada com cuidado.

## PIN local e espaços isolados

O PIN da Sprint 8 é um **bloqueio de interface neste dispositivo**, não uma
camada de criptografia para todo o storage. O valor original não é persistido:
um salt aleatório e um verificador PBKDF2-SHA-256 com custo iterativo são
armazenados localmente. Verificação, troca e desativação acontecem via Web
Crypto, sem servidor, analytics ou logs do PIN.

Visitante e Demonstração usam armazenamento efêmero separado dos dados
pessoais. Nesses espaços, sync, backup remoto e métricas são bloqueados também
no core. A Demo é preenchida somente com fixtures fictícias e nunca deriva
exemplos do conteúdo Pessoal.

Prévias de importação exibem categorias, não registros inteiros. Backup
protegido precisa ser descriptografado/validado antes dessa prévia e a
restauração continua transacional. Cartões visuais são renderizados localmente
e recebem apenas título/texto explicitamente selecionados, sem nome,
localização, chave ou identificadores do Abrigo.

## Processamento local e métricas

Retrospectiva, pesquisa, humor, memórias, Marcos e sugestões emocionais são
processados localmente. Momento do Dia não recebe texto pessoal nem realiza
chamadas externas. A pesquisa não cria índice remoto plaintext. Nenhum desses
recursos oferece diagnóstico ou inferência clínica.

O modo privacidade é visual: não criptografa o armazenamento local, não bloqueia
o dispositivo e não impede screenshots.

Métricas anônimas exigem consentimento explícito e usam infraestrutura
separada. Eventos têm esquema fechado e token temporário sem ligação com
Abrigo, chave ou conteúdo. Não há publicidade, fingerprinting, rastreamento
entre sites ou perfil individual. O painel depende de autenticação server-side.

## Recursos preservados da Sprint 5

O Assistente opcional implementado na Sprint 5 foi descontinuado pela
reformulação emocional. Seus prompts, preferências e integrações externas não
fazem parte da experiência vigente. A remoção não altera as garantias de
criptografia, sincronização, backup, compartilhamento ou métricas.

Cápsulas locais usam AES-GCM e chave exclusiva. O storage guarda ciphertext e
hash de token; chave e token ficam somente em memória. O backup inclui apenas
metadados de cápsulas. O histórico autorizado entra no backup remoto
consolidado criptografado e é excluído do backup plaintext de compatibilidade.

Essas são as cápsulas de **compartilhamento** da Sprint 5. As **Cápsulas para o
futuro** da Sprint 7 são um módulo pessoal local diferente: seguem a mesma
limitação já documentada para os demais dados locais normais e não prometem
criptografia individual no `localStorage`. A interface não revela a mensagem
antes da data escolhida; quando entram em backup remoto, recebem a proteção do
backup consolidado AES-GCM existente. Nenhum endpoint, tabela ou RPC novo foi
criado para elas.

Interações do céu, Modo Só Ficar e tempo de contemplação não são registrados
como analytics identificável nem usados para inferência emocional.

A exportação remove campos internos, sanitiza nomes e oferece prévia. JSON pode
usar AES-GCM com PBKDF2-SHA-256. Recursos remotos da Sprint 5 ficam desativados
sem endpoints server-side revisados.
