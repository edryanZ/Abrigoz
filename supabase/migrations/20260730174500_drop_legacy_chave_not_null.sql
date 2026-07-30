-- A chave original não deve ser armazenada.
-- O Abrigo utiliza somente o hash SHA-256.

alter table public.abrigos
alter column chave drop not null;