# Funcionamento offline

Os módulos pessoais, Momento do Dia, céu, configurações e exportação permanecem
locais. Músicas podem ser guardadas sob demanda. O service worker não inclui
MP3 no precache e limita o cache de áudio.

O Momento do Dia e as sugestões emocionais atuais não fazem chamadas externas:
são escolhidos localmente e nunca entram na SyncQueue.
O usuário deve revisar e confirmar novamente.

Atualizações da PWA exibem aviso e só recarregam após confirmação. As limpezas
removem caches públicos e áudio reconstruível, nunca registros pessoais. A
estimativa usa StorageManager quando disponível.
