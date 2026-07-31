export const musicas = Object.freeze([
  ["midnight-stroll","Midnight Stroll","Ghostrifter Official","CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"],
  ["and-so-it-begins","And So It Begins","Artificial.Music","CC BY 3.0","https://creativecommons.org/licenses/by/3.0/"],
  ["autumn-2011","Autumn 2011","Loxbeats","CC BY 3.0","https://creativecommons.org/licenses/by/3.0/"],
  ["fragile","Fragile","A Himitsu","CC BY 3.0","https://creativecommons.org/licenses/by/3.0/"],
  ["mellow-days","Mellow Days","Pold","CC BY-SA 3.0","https://creativecommons.org/licenses/by-sa/3.0/"],
  ["up-above","Up Above","Pyrosion","CC BY-SA 3.0","https://creativecommons.org/licenses/by-sa/3.0/"],
].map(([id, titulo, artista, licenca, licencaUrl]) => Object.freeze({
  id, titulo, artista, licenca, licencaUrl,
  arquivo: `/audio/${id}.mp3`,
})));
