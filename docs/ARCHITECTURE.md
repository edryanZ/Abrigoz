# Arquitetura

ABRIGO_2_SPEC.md e a fonte normativa desta arquitetura.

O projeto e organizado em app, shared, modules, core e assets. Shared contem elementos reutilizaveis; Core contem infraestrutura global; cada funcionalidade pertence a um modulo.

Modulos nao dependem diretamente de outros modulos. Persistencia e regras de negocio ficam em Storage, Services ou Repository; componentes React ficam restritos a interface e coordenacao local.

Cada modulo cria somente as pastas necessarias. Consulte a especificacao para a estrutura permitida e CONTRIBUTING para o fluxo de contribuicao.
