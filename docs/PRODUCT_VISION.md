# Visão do Produto

`ABRIGO_2_SPEC.md` é a fonte normativa do Abrigo.

## Propósito

O Abrigo é **um espaço digital de acolhimento, reflexão e motivação leve**.
Existe para oferecer calma, pequenas pausas e um lugar simples onde a pessoa
possa guardar aquilo que importa sem transformar cuidado pessoal em cobrança.

## Missão

Oferecer uma experiência pessoal, simples e acolhedora que respeite o ritmo e
as escolhas de cada pessoa, funcionando plenamente de forma local.

## Visão

Ser um espaço digital no qual privacidade e controle do usuário façam parte da
experiência desde o início. Sincronização, quando desejada, é uma extensão
opcional do Abrigo local e nunca uma condição para usá-lo.

## Valores e personalidade

- acolhimento sem cobrança;
- simplicidade e clareza;
- privacidade por padrão;
- autonomia e controle do usuário;
- acessibilidade;
- compatibilidade não destrutiva com dados já guardados;
- tecnologia discreta, sem aparência de produtividade ou performance.

## Pilares

### Experiência local

Lar, Momento do Dia, Reflexões, Intenções, Pequenos Cuidados, Coisas que fazem
bem, Meu Dia e Retrospectiva funcionam sem conta e sem sincronização. O Momento
do Dia é local e determinístico; não há Assistente ou serviço de IA na direção
vigente do produto.

### Privacidade e conexão opcional

A Chave do Abrigo é a forma de conectar e recuperar um Abrigo sincronizado em
outros dispositivos. A pessoa controla a própria chave, cuja forma original
nunca é armazenada no banco. O Supabase é usado somente como infraestrutura de
banco e sincronização, e a identificação remota utiliza o hash SHA-256 da
chave.

Backups remotos já são protegidos com AES-GCM e derivação HKDF-SHA-256. A
sincronização é opcional: sem Supabase disponível, a experiência local continua
funcionando.

### Continuidade

Dados históricos permanecem compatíveis. Mudanças de nomenclatura na interface
não renomeiam automaticamente storage keys nem apagam registros existentes.

## Direção atual

- consolidar a experiência emocional definida em `ABRIGO_2_SPEC.md`;
- manter a arquitetura Module First;
- preservar Lar e navegação simples como entrada principal;
- manter Reflexões, Intenções, Pequenos Cuidados, Coisas que fazem bem, Meu Dia
  e Retrospectiva compatíveis com os formatos históricos;
- manter backup protegido e sincronização criptografada opcionais;
- preservar exportação, compartilhamento textual seguro, PWA, música e céu
  dentro das regras atuais de privacidade.

### O Abrigo como lugar

Atmosfera, acolhimento, memória e privacidade formam a camada de experiência da
Sprint 7. O céu pode dar identidade ao espaço, mas reduz presença em leitura,
formulários e configurações. Só Ficar/Janela do Abrigo oferece uma pausa sem
métricas. Meu Abrigo permite preferências leves sem criar perfil social.

Memórias reaparecem apenas por regras locais previsíveis e podem ser ocultadas.
O produto não usa horário, interações do céu ou tempo de permanência para
inferir estado emocional.

## Notificações

Notificações futuras, quando existirem, devem responder a uma escolha explícita
da pessoa, como a chegada de uma cápsula, um lembrete consciente ou um evento do
Meu Dia. O Abrigo não usa mensagens de retorno baseadas em ausência, sequência,
culpa, perda de progresso ou medo de ficar para trás.

## Histórico de evolução

Dashboard, Diário, Metas, Hábitos, Favoritos, Estatísticas, Conquistas e o
Assistente fizeram parte de etapas anteriores. Os dados compatíveis dessas
experiências são preservados, mas suas antigas propostas de produtividade,
gamificação e IA não definem a experiência atual. O histórico detalhado das
Sprints permanece em `ROADMAP.md`.

Aplicativos móveis nativos não fazem parte do escopo vigente documentado; a
experiência atual é Web/PWA e mobile-first.

## Controle e redução

A Sprint 8 torna explícita a regra “O Abrigo deve poder ficar menor”. A pessoa
pode esconder módulos opcionais da navegação sem apagar conteúdo e escolher até
três atalhos. Configurações, privacidade e recuperação continuam acessíveis.

Pessoal é o espaço real; Visitante é uma sessão efêmera; Demonstração usa
somente exemplos fictícios. Nenhum deles exige conta ou e-mail. O PIN opcional
é descrito honestamente como bloqueio local de interface, e não como
criptografia total do dispositivo.

Memórias podem aparecer por tempo/data, em mapa abstrato ou constelação
simbólica, sempre localmente, sem GPS, diagnóstico ou desempenho. Rituais
mensais dependem de opt-in e nunca cobram resposta, meta, sequência ou prazo.
