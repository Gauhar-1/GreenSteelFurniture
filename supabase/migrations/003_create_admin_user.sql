-- ============================================================================
-- Green Steel Furniture — Grant Admin Access & Fix Permissions
-- Run this in the Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Grant table permissions to Supabase API roles (fixes 'permission denied for table admin_users')
GRANT ALL ON TABLE public.admin_users TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Ensure RLS allows authenticated users to read their own record without recursive lock
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow authenticated read on admin_users" ON public.admin_users;

CREATE POLICY "Allow authenticated read on admin_users" ON public.admin_users
    FOR SELECT TO authenticated
    USING (id = auth.uid() OR public.is_admin());

-- 3. Update JWT app_metadata for instant token authorization
UPDATE auth.users
SET 
    raw_app_meta_data = jsonb_set(COALESCE(raw_app_meta_data, '{}'::jsonb), '{role}', '"admin"'),
    raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"admin"')
WHERE email = 'mdgoharkhan44@gmail.com';

-- 4. Insert or update user record in public.admin_users
INSERT INTO public.admin_users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'mdgoharkhan44@gmail.com'
ON CONFLICT (id) DO UPDATE
SET 
    role = 'admin',
    updated_at = now();

-- 5. Verification Notice
DO $$
DECLARE
    admin_count INT;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM public.admin_users WHERE email = 'mdgoharkhan44@gmail.com';
    IF admin_count > 0 THEN
        RAISE NOTICE 'SUCCESS: mdgoharkhan44@gmail.com is now fully registered as an active administrator!';
    ELSE
        RAISE WARNING 'User mdgoharkhan44@gmail.com was not found in auth.users. Please create the user in Authentication -> Users first.';
    END IF;
END $$;
