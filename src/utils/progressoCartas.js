export function obterProgresso(categoria){

    const historico = JSON.parse(
        localStorage.getItem(`cartas-${categoria.id}`)
    ) || [];

    return {
        lidas: historico.length,
        total: categoria.cartas.length,
        completo: historico.length === categoria.cartas.length
    };

}