# Funcionamento offline

Os módulos pessoais, Momento do Dia, céu, configurações e exportação permanecem
locais. Músicas podem ser guardadas sob demanda. O service worker não inclui
MP3 no precache e limita o cache de áudio.

Atmosfera 2.0, Meu Abrigo, Modo Só Ficar, cápsulas futuras e memórias funcionam
sem rede. O céu usa somente hora/data do dispositivo e não consulta clima ou
localização. Não há assets locais apropriados para sons ambientes nesta Sprint;
os slots existem sem reprodução simulada ou remota.

O Momento do Dia e as sugestões emocionais atuais não fazem chamadas externas:
são escolhidos localmente e nunca entram na SyncQueue.
O usuário deve revisar e confirmar novamente.

Atualizações da PWA exibem aviso e só recarregam após confirmação. As limpezas
removem caches públicos e áudio reconstruível, nunca registros pessoais. A
estimativa usa StorageManager quando disponível.

Na Sprint 8, `beforeinstallprompt` pode gerar uma sugestão discreta de
instalação. “Agora não” é persistido e evita repetição em toda visita. O
manifest oferece somente Só Ficar, Reflexões, Momento do Dia e Meu Dia como
shortcuts. Mensagens sem rede preservam linguagem humana e atualizações
continuam dependendo de confirmação explícita.

Visitante e Demonstração também são locais, mas usam memória efêmera isolada:
não sincronizam nem fazem backup remoto. Cartões de compartilhamento são
renderizados localmente e não dependem de rede.
