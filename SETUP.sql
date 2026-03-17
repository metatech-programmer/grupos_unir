CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- RESET TOTAL (DESTRUCTIVO)
-- Elimina objetos de esta app para recrearlos
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created_or_updated ON auth.users;

DROP FUNCTION IF EXISTS public.handle_auth_user_sync() CASCADE;
DROP FUNCTION IF EXISTS public.create_group_atomic(TEXT, TEXT, INT, TEXT, INT, INT, INT, TEXT[], TEXT[], TEXT[]) CASCADE;
DROP FUNCTION IF EXISTS public.join_group_atomic(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.leave_group_atomic(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_of_group(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_member_of_group(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.current_user_profile_id() CASCADE;

DROP TABLE IF EXISTS public.group_messages CASCADE;
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;

-- Create groups table first because users.group_id references groups.id
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  created_by_auth UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  members TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  member_count INT NOT NULL DEFAULT 0,
  max_size INT NOT NULL DEFAULT 5 CHECK (max_size BETWEEN 3 AND 5),
  preferred_work_style TEXT NOT NULL DEFAULT 'flexible',
  required_daily_hours INT NOT NULL DEFAULT 2,
  active_hours_start INT NOT NULL DEFAULT 18,
  active_hours_end INT NOT NULL DEFAULT 22,
  activity_focus TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  timezone_coverage TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  pros TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  cons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT groups_name_unique UNIQUE (name)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(40),
  country VARCHAR(100),
  timezone VARCHAR(100),
  work_status TEXT NOT NULL DEFAULT 'student',
  activities TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  daily_hours INT NOT NULL DEFAULT 2,
  availability_start INT NOT NULL DEFAULT 18,
  availability_end INT NOT NULL DEFAULT 22,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS work_status TEXT NOT NULL DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS activities TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_hours INT NOT NULL DEFAULT 2;
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_start INT NOT NULL DEFAULT 18;
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_end INT NOT NULL DEFAULT 22;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(40);

ALTER TABLE groups ADD COLUMN IF NOT EXISTS preferred_work_style TEXT NOT NULL DEFAULT 'flexible';
ALTER TABLE groups ADD COLUMN IF NOT EXISTS required_daily_hours INT NOT NULL DEFAULT 2;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS active_hours_start INT NOT NULL DEFAULT 18;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS active_hours_end INT NOT NULL DEFAULT 22;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS activity_focus TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE groups ADD COLUMN IF NOT EXISTS created_by_auth UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create group_members junction table
CREATE TABLE IF NOT EXISTS group_members (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, group_id)
);

ALTER TABLE group_members ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member';

UPDATE group_members gm
SET role = 'admin'
FROM groups g
JOIN users u ON u.auth_id = g.created_by_auth
WHERE gm.group_id = g.id
  AND gm.user_id = u.id;

CREATE TABLE IF NOT EXISTS group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION public.current_user_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.users
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.current_user_profile_id() TO authenticated;

CREATE OR REPLACE FUNCTION public.is_member_of_group(target_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.user_id = public.current_user_profile_id()
      AND gm.group_id = target_group_id
  )
  OR EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = public.current_user_profile_id()
      AND u.group_id = target_group_id
  )
  OR EXISTS (
    SELECT 1
    FROM public.groups g
    WHERE g.id = target_group_id
      AND public.current_user_profile_id()::text = ANY(g.members)
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_member_of_group(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_admin_of_group(target_group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.user_id = public.current_user_profile_id()
      AND gm.group_id = target_group_id
      AND gm.role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_of_group(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    auth_id,
    name,
    email,
    phone,
    country,
    timezone,
    work_status,
    activities,
    daily_hours,
    availability_start,
    availability_end,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'Usuario'),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country',
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'Europe/Madrid'),
    COALESCE(NEW.raw_user_meta_data->>'work_status', 'student'),
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(NEW.raw_user_meta_data->'activities', '[]'::jsonb))),
      ARRAY[]::TEXT[]
    ),
    COALESCE((NEW.raw_user_meta_data->>'daily_hours')::INT, 2),
    COALESCE((NEW.raw_user_meta_data->>'availability_start')::INT, 18),
    COALESCE((NEW.raw_user_meta_data->>'availability_end')::INT, 22),
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (auth_id)
  DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    country = EXCLUDED.country,
    timezone = EXCLUDED.timezone,
    work_status = EXCLUDED.work_status,
    activities = EXCLUDED.activities,
    daily_hours = EXCLUDED.daily_hours,
    availability_start = EXCLUDED.availability_start,
    availability_end = EXCLUDED.availability_end,
    updated_at = CURRENT_TIMESTAMP;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_group_atomic(
  p_name TEXT,
  p_subject TEXT,
  p_max_size INT,
  p_preferred_work_style TEXT,
  p_required_daily_hours INT,
  p_active_hours_start INT,
  p_active_hours_end INT,
  p_activity_focus TEXT[],
  p_pros TEXT[],
  p_cons TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_auth_id UUID;
  v_timezone TEXT;
  v_group_id UUID;
BEGIN
  v_user_id := public.current_user_profile_id();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Perfil de usuario no encontrado para auth.uid()=%', auth.uid();
  END IF;

  SELECT auth_id, timezone
  INTO v_auth_id, v_timezone
  FROM public.users
  WHERE id = v_user_id
  FOR UPDATE;

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'No se pudo recuperar auth_id del usuario actual';
  END IF;

  INSERT INTO public.groups (
    name,
    subject,
    created_by_auth,
    members,
    member_count,
    max_size,
    preferred_work_style,
    required_daily_hours,
    active_hours_start,
    active_hours_end,
    activity_focus,
    timezone_coverage,
    pros,
    cons
  )
  VALUES (
    p_name,
    p_subject,
    v_auth_id,
    ARRAY[v_user_id::TEXT],
    1,
    p_max_size,
    p_preferred_work_style,
    p_required_daily_hours,
    p_active_hours_start,
    p_active_hours_end,
    COALESCE(p_activity_focus, ARRAY[]::TEXT[]),
    ARRAY[COALESCE(v_timezone, 'Europe/Madrid')],
    COALESCE(p_pros, ARRAY[]::TEXT[]),
    COALESCE(p_cons, ARRAY[]::TEXT[])
  )
  RETURNING id INTO v_group_id;

  INSERT INTO public.group_members (user_id, group_id, role)
  VALUES (v_user_id, v_group_id, 'admin')
  ON CONFLICT (user_id, group_id) DO UPDATE SET role = EXCLUDED.role;

  UPDATE public.users
  SET group_id = v_group_id
  WHERE id = v_user_id;

  RETURN v_group_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_group_atomic(TEXT, TEXT, INT, TEXT, INT, INT, INT, TEXT[], TEXT[], TEXT[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.join_group_atomic(p_group_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_group groups%ROWTYPE;
BEGIN
  v_user_id := public.current_user_profile_id();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Perfil de usuario no encontrado para auth.uid()=%', auth.uid();
  END IF;

  SELECT *
  INTO v_group
  FROM public.groups
  WHERE id = p_group_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Grupo no encontrado';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = v_user_id
      AND group_id = p_group_id
  ) THEN
    UPDATE public.users
    SET group_id = p_group_id
    WHERE id = v_user_id;

    RETURN p_group_id;
  END IF;

  IF v_group.member_count >= v_group.max_size THEN
    RAISE EXCEPTION 'El grupo ya esta lleno';
  END IF;

  INSERT INTO public.group_members (user_id, group_id, role)
  VALUES (v_user_id, p_group_id, 'member')
  ON CONFLICT (user_id, group_id) DO NOTHING;

  UPDATE public.users
  SET group_id = p_group_id
  WHERE id = v_user_id;

  UPDATE public.groups g
  SET
    member_count = (
      SELECT COUNT(*)::INT
      FROM public.group_members gm
      WHERE gm.group_id = p_group_id
    ),
    members = (
      SELECT COALESCE(ARRAY_AGG(gm.user_id::TEXT ORDER BY gm.joined_at), ARRAY[]::TEXT[])
      FROM public.group_members gm
      WHERE gm.group_id = p_group_id
    ),
    timezone_coverage = (
      SELECT COALESCE(ARRAY_AGG(DISTINCT COALESCE(u.timezone, 'Europe/Madrid')), ARRAY[]::TEXT[])
      FROM public.group_members gm
      JOIN public.users u ON u.id = gm.user_id
      WHERE gm.group_id = p_group_id
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE g.id = p_group_id;

  RETURN p_group_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_group_atomic(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.leave_group_atomic(p_group_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_group groups%ROWTYPE;
BEGIN
  v_user_id := public.current_user_profile_id();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Perfil de usuario no encontrado para auth.uid()=%', auth.uid();
  END IF;

  SELECT *
  INTO v_group
  FROM public.groups
  WHERE id = p_group_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Grupo no encontrado';
  END IF;

  IF v_group.created_by_auth = auth.uid() THEN
    RAISE EXCEPTION 'El creador del grupo no puede salir sin eliminar o transferir administracion';
  END IF;

  DELETE FROM public.group_members
  WHERE user_id = v_user_id
    AND group_id = p_group_id;

  UPDATE public.users
  SET group_id = NULL
  WHERE id = v_user_id
    AND group_id = p_group_id;

  UPDATE public.groups g
  SET
    member_count = (
      SELECT COUNT(*)::INT
      FROM public.group_members gm
      WHERE gm.group_id = p_group_id
    ),
    members = (
      SELECT COALESCE(ARRAY_AGG(gm.user_id::TEXT ORDER BY gm.joined_at), ARRAY[]::TEXT[])
      FROM public.group_members gm
      WHERE gm.group_id = p_group_id
    ),
    timezone_coverage = (
      SELECT COALESCE(ARRAY_AGG(DISTINCT COALESCE(u.timezone, 'Europe/Madrid')), ARRAY[]::TEXT[])
      FROM public.group_members gm
      JOIN public.users u ON u.id = gm.user_id
      WHERE gm.group_id = p_group_id
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE g.id = p_group_id;

  RETURN p_group_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.leave_group_atomic(UUID) TO authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created_or_updated ON auth.users;

CREATE TRIGGER on_auth_user_created_or_updated
  AFTER INSERT OR UPDATE OF email, raw_user_meta_data
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_sync();

CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_group_id ON users(group_id);
CREATE INDEX IF NOT EXISTS idx_groups_member_count ON groups(member_count);
CREATE INDEX IF NOT EXISTS idx_groups_created_by_auth ON groups(created_by_auth);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Make policy creation idempotent
DROP POLICY IF EXISTS users_select_policy ON users;
DROP POLICY IF EXISTS users_select_group_members_policy ON users;
DROP POLICY IF EXISTS users_insert_policy ON users;
DROP POLICY IF EXISTS users_update_policy ON users;

DROP POLICY IF EXISTS groups_select_policy ON groups;
DROP POLICY IF EXISTS groups_insert_policy ON groups;
DROP POLICY IF EXISTS groups_update_policy ON groups;
DROP POLICY IF EXISTS groups_delete_policy ON groups;

DROP POLICY IF EXISTS group_members_select_policy ON group_members;
DROP POLICY IF EXISTS group_members_insert_policy ON group_members;
DROP POLICY IF EXISTS group_members_delete_policy ON group_members;
DROP POLICY IF EXISTS group_members_update_policy ON group_members;

DROP POLICY IF EXISTS group_messages_select_policy ON group_messages;
DROP POLICY IF EXISTS group_messages_insert_policy ON group_messages;
DROP POLICY IF EXISTS group_messages_delete_policy ON group_messages;

DROP POLICY IF EXISTS push_subscriptions_select_policy ON push_subscriptions;
DROP POLICY IF EXISTS push_subscriptions_insert_policy ON push_subscriptions;
DROP POLICY IF EXISTS push_subscriptions_update_policy ON push_subscriptions;
DROP POLICY IF EXISTS push_subscriptions_delete_policy ON push_subscriptions;

-- users: each authenticated user can only see and manage their row
CREATE POLICY users_select_policy ON users
  FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY users_select_group_members_policy ON users
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND
    EXISTS (
      SELECT 1
      FROM group_members gm_me
      JOIN group_members gm_target ON gm_target.group_id = gm_me.group_id
      WHERE gm_me.user_id = public.current_user_profile_id()
        AND gm_target.user_id = users.id
    )
  );

CREATE POLICY users_insert_policy ON users
  FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY users_update_policy ON users
  FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- groups: public read, authenticated write
CREATE POLICY groups_select_policy ON groups
  FOR SELECT
  USING (true);

CREATE POLICY groups_insert_policy ON groups
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY groups_update_policy ON groups
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY groups_delete_policy ON groups
  FOR DELETE
  USING (auth.uid() = created_by_auth);

-- group_members: allow only operations over rows owned by the auth user
CREATE POLICY group_members_select_policy ON group_members
  FOR SELECT
  USING (public.is_member_of_group(group_members.group_id));

CREATE POLICY group_members_insert_policy ON group_members
  FOR INSERT
  WITH CHECK (
    group_members.user_id = public.current_user_profile_id()
  );

CREATE POLICY group_members_delete_policy ON group_members
  FOR DELETE
  USING (
    group_members.user_id = public.current_user_profile_id()
  );

CREATE POLICY group_members_update_policy ON group_members
  FOR UPDATE
  USING (public.is_admin_of_group(group_members.group_id))
  WITH CHECK (public.is_admin_of_group(group_members.group_id));

CREATE POLICY group_messages_select_policy ON group_messages
  FOR SELECT
  USING (public.is_member_of_group(group_messages.group_id));

CREATE POLICY group_messages_insert_policy ON group_messages
  FOR INSERT
  WITH CHECK (
    public.is_member_of_group(group_messages.group_id)
    AND group_messages.user_id = public.current_user_profile_id()
  );

CREATE POLICY group_messages_delete_policy ON group_messages
  FOR DELETE
  USING (group_messages.user_id = public.current_user_profile_id());

CREATE POLICY push_subscriptions_select_policy ON push_subscriptions
  FOR SELECT
  USING (push_subscriptions.user_id = public.current_user_profile_id());

CREATE POLICY push_subscriptions_insert_policy ON push_subscriptions
  FOR INSERT
  WITH CHECK (push_subscriptions.user_id = public.current_user_profile_id());

CREATE POLICY push_subscriptions_update_policy ON push_subscriptions
  FOR UPDATE
  USING (push_subscriptions.user_id = public.current_user_profile_id())
  WITH CHECK (push_subscriptions.user_id = public.current_user_profile_id());

CREATE POLICY push_subscriptions_delete_policy ON push_subscriptions
  FOR DELETE
  USING (push_subscriptions.user_id = public.current_user_profile_id());
