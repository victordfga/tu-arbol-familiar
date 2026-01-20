-- 1. Drop the existing strict constraint
ALTER TABLE public.trees
DROP CONSTRAINT IF EXISTS trees_created_by_fkey;

-- 2. Re-add it with ON DELETE CASCADE
ALTER TABLE public.trees
ADD CONSTRAINT trees_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 3. Also cleaning up any orphan data if necessary (optional manual cleanup)
-- DELETE FROM public.trees WHERE created_by = 'ID_DEL_USUARIO';
