# Céu dinâmico

O céu usa o relógio local: madrugada 00:00–04:59, amanhecer 05:00–07:29,
manhã 07:30–11:59, tarde 12:00–16:59, entardecer 17:00–18:59 e noite
19:00–23:59.

O sistema agenda a próxima troca, atualiza ao retornar à aba e não verifica a
cada segundo. Pré-visualizações são temporárias e não alteram relógio ou
storage. Tema claro/escuro/sistema e período são dimensões diferentes.

O visual usa a paleta e o brilho do ícone PWA como referência, mas não amplia,
repete ou usa o ícone como fundo. São apenas gradientes e pseudo-elementos CSS,
sem raster, vídeo, canvas, WebGL ou biblioteca de partículas. Redução de
movimento desliga transições e deslocamento.
