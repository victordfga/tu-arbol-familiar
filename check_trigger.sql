-- Script para limpiar usuarios de prueba y preparar para testing
-- Ejecuta esto en Supabase SQL Editor antes de hacer nuevas pruebas

-- 1. Ver usuarios sin árbol completo
SELECT 
    u.id, 
    u.email, 
    u.created_at,
    t.id as tree_id,
    tm.id as member_id,
    p.id as person_id
FROM auth.users u
LEFT JOIN public.tree_members tm ON u.id = tm.user_id
LEFT JOIN public.trees t ON tm.tree_id = t.id
LEFT JOIN public.people p ON t.id = p.tree_id
WHERE tm.user_id IS NULL OR t.id IS NULL OR p.id IS NULL
ORDER BY u.created_at DESC;

-- 2. Eliminar usuarios sin árbol completo (CUIDADO: Solo para testing/desarrollo)
-- Descomenta las siguientes líneas para ejecutar la limpieza:

/*
DELETE FROM auth.users
WHERE id IN (
  SELECT u.id 
  FROM auth.users u
  LEFT JOIN public.tree_members tm ON u.id = tm.user_id
  WHERE tm.user_id IS NULL
);
*/

-- 3. Verificar el estado del trigger
SELECT 
    tgname as trigger_name,
    tgenabled as status,
    pg_get_triggerdef(oid) as definition
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 4. Verificar que la función existe
SELECT 
    proname as function_name,
    prosecdef as is_security_definer
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 5. Ver todos los usuarios y sus árboles (para debugging)
SELECT 
    u.email,
    u.created_at as user_created,
    t.name as tree_name,
    tm.role,
    COUNT(p.id) as people_count
FROM auth.users u
LEFT JOIN public.tree_members tm ON u.id = tm.user_id
LEFT JOIN public.trees t ON tm.tree_id = t.id
LEFT JOIN public.people p ON t.id = p.tree_id
GROUP BY u.email, u.created_at, t.name, tm.role
ORDER BY u.created_at DESC;
