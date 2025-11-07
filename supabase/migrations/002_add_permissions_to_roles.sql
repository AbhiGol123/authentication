-- Add permissions column to roles table
alter table public.roles add column if not exists permissions jsonb default '{}';

-- Update existing roles with default permissions
update public.roles 
set permissions = case 
  when name = 'admin' then '{"user_management": true, "role_management": true}'
  when name = 'superadmin' then '{"user_management": true, "role_management": true}'
  when name = 'moderator' then '{"user_management": false, "role_management": false}'
  when name = 'user' then '{"user_management": false, "role_management": false}'
  else '{"user_management": false, "role_management": false}'
end
where permissions = '{}' or permissions is null;

-- Ensure superadmin role exists with proper permissions
insert into public.roles (name, description, permissions) 
values ('superadmin', 'Super administrator with all permissions', '{"user_management": true, "role_management": true}')
on conflict (name) do nothing;