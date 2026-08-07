# Abrigo 2.0 — Especificação Oficial

Status: Ativa

Esta é a fonte normativa do projeto. Em caso de conflito, este documento
prevalece até que a documentação complementar seja atualizada.

## Identidade do produto

O Abrigo é **um espaço digital de acolhimento, reflexão e motivação leve**.
Ele existe para oferecer calma, pequenas pausas, memórias positivas e um lugar
simples onde a pessoa possa guardar aquilo que faz bem.

O Abrigo pode convidar e incentivar, mas nunca cobrar. Nenhuma experiência deve
fazer a pessoa sentir que está atrasada, falhou, perdeu uma sequência ou precisa
ser produtiva para usar o aplicativo. Preencher, escrever, acompanhar ou
sincronizar é sempre opcional.

O Abrigo não é planner, gerenciador de produtividade, rastreador de performance,
rede social, terapia, ferramenta médica, diário íntimo obrigatório nem
assistente de inteligência artificial. Deve continuar útil mesmo quando a
pessoa fornece pouquíssimos dados pessoais.

## Experiências principais

- **Lar:** um início calmo, com saudação, humor opcional e poucos convites.
- **Momento do Dia:** uma reflexão local e determinística por dia, sem chat,
  prompt, backend ou coleta de texto pessoal.
- **Reflexões:** uma pergunta leve por dia; guardar uma resposta é opcional.
  Entradas históricas do antigo Diário permanecem acessíveis.
- **Intenções:** desejos leves que podem ser guardados e encerrados quando não
  fizerem mais sentido. Registros históricos de Metas são preservados.
- **Pequenos Cuidados:** convites gentis que podem ser marcados como “Fiz isso
  por mim hoje”, sem sequência, punição ou desempenho. O histórico de Hábitos
  permanece preservado.
- **Coisas que fazem bem:** referências e lembranças simples, compatíveis com os
  dados existentes de Favoritos.
- **Meu Dia:** o Calendário permanece funcional e opcional, sem ocupar o centro
  da experiência.
- **Retrospectiva:** apresenta acontecimentos e registros de forma narrativa,
  sem comparação de desempenho. Marcos naturais substituem a gamificação de
  Conquistas e podem aparecer de forma discreta nessa experiência.
- **Cartas, Pesquisa, Música, céu, Exportação e Sincronização:** continuam
  disponíveis conforme os limites de privacidade e arquitetura existentes.

## Princípios

Simplicidade, acolhimento, baixo acoplamento, alta coesão, reutilização,
performance, acessibilidade, segurança e privacidade. A interface é Mobile
First, glassmorphism, respirável e sem aparência corporativa ou de painel de
produtividade. Animações são lentas e discretas e respeitam
`prefers-reduced-motion`.

## Atmosfera do Abrigo

O céu cria atmosfera; o conteúdo continua sendo o protagonista. A atmosfera é
global, local e persistente durante a navegação, acompanha gradualmente a hora
do dispositivo e pode variar deterministicamente pela data local. Não usa
clima, localização, perfil emocional, API externa ou comportamento pessoal.

Telas de leitura, formulários, pesquisa e configurações reduzem automaticamente
a densidade visual. Espaços de pausa podem permitir uma atmosfera mais presente.
Movimento decorativo nunca bloqueia controles e é reduzido de forma substancial
quando `prefers-reduced-motion` está ativo.

Na inicialização real da aplicação, uma Splash curta apresenta o Abrigo antes
do fluxo local existente de Welcome ou Lar. Ela não é uma rota, não entra no
histórico e não reaparece durante a navegação.

## Arquitetura

O Abrigo segue Module First. Módulos podem conter apenas as pastas necessárias
entre pages, components, hooks, services, storage, styles, utils, data e
`index.js`. Módulos não importam diretamente outros módulos; a comunicação
ocorre por core, services, hooks, contexts ou eventos.

Componentes React não acessam `localStorage`, `sessionStorage`, IndexedDB,
Supabase, `CryptoKey` ou infraestrutura remota diretamente. Persistência e
regras passam por Storage, Services, Repository, hooks e contexts.

As experiências emocionais novas são locais. Não existe serviço de IA,
chatbot, prompt ou envio de conteúdo pessoal para geração externa.

## Dados antigos e compatibilidade

A reformulação é não destrutiva. Chaves de armazenamento e formatos históricos
de Diário, Metas, Hábitos, Favoritos e demais módulos devem ser preservados
sempre que possível. A interface pode adaptar registros antigos por uma camada
de compatibilidade, mas nunca apagá-los ou reescrevê-los irreversivelmente sem
ação explícita da pessoa.

## Sincronização e segurança

A sincronização é opcional e baseada na Chave do Abrigo. A chave original não
é armazenada no banco nem exposta em logs, URLs ou erros. O hash SHA-256
identifica o Abrigo no banco. Backups remotos permanecem consolidados e
protegidos por AES-GCM com derivação HKDF-SHA-256; nenhum módulo privado passa
a ser enviado individualmente.

## Documentação

`ARCHITECTURE` detalha a organização técnica; `SECURITY` as garantias de
segurança; `DATABASE` os limites de dados; `ROADMAP` registra a evolução do
produto; `DESIGN_SYSTEM` define a linguagem visual e de experiência.
