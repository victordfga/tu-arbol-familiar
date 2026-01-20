-- 1. Borrar manualmente los datos dependientes (romper el bloqueo)
-- Borra cualquier invitación pendiente de este usuario
delete from public.invitations where created_by = '3cde55bf-4c8c-484c-9138-e90b2d051c3e';

-- Borra los miembros de árboles asociados (si quedaron huérfanos)
delete from public.tree_members where user_id = '3cde55bf-4c8c-484c-9138-e90b2d051c3e';

-- Borra los árboles creados por este usuario (esto es lo que daba error)
delete from public.trees where created_by = '3cde55bf-4c8c-484c-9138-e90b2d051c3e';

-- 2. Ahora sí, borrar el usuario
delete from auth.users where id = '3cde55bf-4c8c-484c-9138-e90b2d051c3e';

-- 3. Solución definitiva: Asegurar que la base de datos permita esto en el futuro
alter table public.trees
drop constraint if exists trees_created_by_fkey;

alter table public.trees
add constraint trees_created_by_fkey
foreign key (created_by)
references auth.users(id)
on delete cascade;
