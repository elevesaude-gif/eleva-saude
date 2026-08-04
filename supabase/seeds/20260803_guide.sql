-- Seed legado desativado de propósito.
-- A versão anterior apagava todas as seções e recriava somente 5, causando perda de conteúdo.
-- Para preparar as 13 seções completas, revise e execute manualmente:
-- scripts/migrate-full-guide-to-cms.sql
do $$
begin
  raise exception 'Seed parcial do guia bloqueado. Use scripts/migrate-full-guide-to-cms.sql após revisão e backup.';
end
$$;
