-- 1. Permitir borrar desde auth.users (en algunos casos es necesario confirmar esto)
-- Simplemente intentaremos borrar el usuario específico para limpiar todo.
-- El "ON DELETE CASCADE" que configuramos antes se encargará del resto de tablas (trees, members, etc).

delete from auth.users where email = 'victorsudden@gmail.com';

-- 2. Asegurar que el Trigger existe y funciona
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_tree_id uuid;
begin
  -- Crear árbol
  insert into public.trees (name, created_by)
  values ('Árbol de ' || new.email, new.id)
  returning id into new_tree_id;

  -- Añadir al usuario como admin
  insert into public.tree_members (tree_id, user_id, role)
  values (new_tree_id, new.id, 'admin');
  
  -- Crear nodo "Yo"
  insert into public.people (tree_id, first_name, is_living, gender)
  values (new_tree_id, 'Yo', true, 'Other');

  return new;
end;
$$ language plpgsql security definer;

-- Re-vincular el trigger por si acaso
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
