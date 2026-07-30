# Abrigo 2.0 - Especificacao Oficial

Status: Ativa

Esta e a unica fonte de verdade do projeto. Em caso de conflito, este documento prevalece.

## Principios

Simplicidade, baixo acoplamento, alta coesao, reutilizacao, performance, acessibilidade, seguranca e privacidade.

## Arquitetura

O Abrigo segue Module First. Modulos podem conter apenas as pastas necessarias entre pages, components, hooks, services, storage, styles, utils, data e index.js. Modulos nao importam diretamente outros modulos; a comunicacao ocorre por services, hooks, contexts ou eventos.

Componentes React nao acessam localStorage, sessionStorage ou infraestrutura remota diretamente. Persistencia passa por Storage, Services ou Repository.

## Sincronizacao e seguranca

A sincronizacao e opcional e baseada na Chave do Abrigo. A chave original nao e armazenada no banco, nem exposta em logs, URLs ou erros. O hash SHA-256 identifica o Abrigo no banco. AES-GCM e a estrategia planejada para criptografia de dados sincronizados.

## Documentacao

ARCHITECTURE detalha a organizacao tecnica; SECURITY detalha a estrategia da chave; DATABASE detalha os limites de dados; ROADMAP define as sprints; DESIGN_SYSTEM define a interface.
