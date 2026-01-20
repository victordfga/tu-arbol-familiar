-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. TREES: Represents a family tree
create table if not exists public.trees (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null default 'Mi Árbol Familiar',
  created_by uuid references auth.users(id) not null
);

-- 2. TREE MEMBERS: Links users to trees with roles
create type public.app_role as enum ('admin', 'editor', 'viewer');

create table if not exists public.tree_members (
  id uuid primary key default uuid_generate_v4(),
  tree_id uuid references public.trees(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role default 'viewer'::app_role not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (tree_id, user_id)
);

-- 3. PEOPLE: The nodes in the family tree
create table if not exists public.people (
  id uuid primary key default uuid_generate_v4(),
  tree_id uuid references public.trees(id) on delete cascade not null,
  
  first_name text not null,
  last_name text,
  
  -- Relations (simplified adjacency list for now, ideally separate logic but this works for simple trees)
  father_id uuid references public.people(id),
  mother_id uuid references public.people(id),
  spouse_id uuid references public.people(id),
  
  -- Details
  birth_date date,
  death_date date,
  is_living boolean default true,
  gender text check (gender in ('Male', 'Female', 'Other')),
  photo_url text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. INVITATIONS: Pending invites
create table if not exists public.invitations (
  id uuid primary key default uuid_generate_v4(),
  tree_id uuid references public.trees(id) on delete cascade not null,
  email text not null,
  role app_role default 'viewer'::app_role not null,
  token text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) not null
);

-- RLS POLICIES (Row Level Security)
alter table public.trees enable row level security;
alter table public.tree_members enable row level security;
alter table public.people enable row level security;

-- Policy: Users can see trees they are members of
create policy "Users can view trees they belong to"
  on public.trees for select
  using (
    exists (
      select 1 from public.tree_members
      where tree_members.tree_id = trees.id
      and tree_members.user_id = auth.uid()
    )
  );

-- Policy: Users can see people in trees they belong to
create policy "Users can view people in their trees"
  on public.people for select
  using (
    exists (
      select 1 from public.tree_members
      where tree_members.tree_id = people.tree_id
      and tree_members.user_id = auth.uid()
    )
  );
  
-- Policy: Editors and Admins can insert/update people
create policy "Editors can manage people"
  on public.people for all
  using (
    exists (
      select 1 from public.tree_members
      where tree_members.tree_id = people.tree_id
      and tree_members.user_id = auth.uid()
      and tree_members.role in ('admin', 'editor')
    )
  );

-- TRIGGER: Auto-create a Tree for new users
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_tree_id uuid;
begin
  -- 1. Create a personal tree
  insert into public.trees (name, created_by)
  values ('Árbol de ' || new.email, new.id)
  returning id into new_tree_id;

  -- 2. Add user as admin member
  insert into public.tree_members (tree_id, user_id, role)
  values (new_tree_id, new.id, 'admin');
  
  -- 3. Create a "self" person node (optional but helpful)
  insert into public.people (tree_id, first_name, is_living, gender)
  values (new_tree_id, 'Yo', true, 'Other');

  return new;
end;
$$ language plpgsql security definer;

-- Bind trigger to auth.users (works if Supabase allows extensions on auth, otherwise must be done manually via UI usually)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
