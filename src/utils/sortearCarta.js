export function sortearCarta(categoria) {

    const chave = `cartas-${categoria.id}`;

    let historico =
        JSON.parse(localStorage.getItem(chave)) || [];

    const restantes =
        categoria.cartas.filter(
            carta =>
                !historico.includes(carta.id)
        );

    if(restantes.length === 0){

        historico = [];

        localStorage.removeItem(chave);

        return sortearCarta(categoria);

    }

    const carta =
        restantes[
            Math.floor(
                Math.random() * restantes.length
            )
        ];

    historico.push(carta.id);

    localStorage.setItem(
        chave,
        JSON.stringify(historico)
    );

    return carta;

}