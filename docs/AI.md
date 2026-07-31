# Assistente do Abrigo

O Assistente complementa o Companheiro local. Ele inicia desligado e oferece
guias locais sem rede. O modo externo exige, separadamente, ativação e permissão
para enviar conteúdo selecionado. Humor, estatísticas, histórico e
recomendações possuem controles próprios.

Antes de enviar, a interface informa serviço, finalidade e conteúdo exato.
Nada é selecionado automaticamente. Desativar cancela a chamada por
`AbortController`; o contexto temporário desaparece ao desmontar.

O navegador chama somente `/api/ai`. Um futuro endpoint server-side poderá usar
`AI_PROVIDER_API_KEY` e `RECOMMENDATIONS_PROVIDER_API_KEY`; essas variáveis não
podem usar prefixo `VITE_`. Nenhuma função foi implantada e nenhum segredo foi
adicionado.

O Assistente não diagnostica, prescreve, substitui profissionais ou pressiona
produtividade. A redaction automática é auxiliar e pode falhar; a revisão do
usuário continua obrigatória.
