CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_group_id ON users(group_id);
CREATE INDEX IF NOT EXISTS idx_groups_member_count ON groups(member_count);
CREATE INDEX IF NOT EXISTS idx_groups_created_by_auth ON groups(created_by_auth);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

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

-- users: each authenticated user can only see and manage their row
CREATE POLICY users_select_policy ON users
  FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY users_select_group_members_policy ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM users me
      JOIN group_members gm_me ON gm_me.user_id = me.id
      JOIN group_members gm_target ON gm_target.group_id = gm_me.group_id
      WHERE me.auth_id = auth.uid()
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
  USING (
    EXISTS (
      SELECT 1
      FROM users me
      JOIN group_members gm_me ON gm_me.user_id = me.id
      WHERE me.auth_id = auth.uid()
        AND gm_me.group_id = group_members.group_id
    )
  );

CREATE POLICY group_members_insert_policy ON group_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.id = group_members.user_id
        AND u.auth_id = auth.uid()
    )
  );

CREATE POLICY group_members_delete_policy ON group_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.id = group_members.user_id
        AND u.auth_id = auth.uid()
    )
  );

CREATE POLICY group_members_update_policy ON group_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM users me
      JOIN group_members gm_me ON gm_me.user_id = me.id
      WHERE me.auth_id = auth.uid()
        AND gm_me.group_id = group_members.group_id
        AND gm_me.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users me
      JOIN group_members gm_me ON gm_me.user_id = me.id
      WHERE me.auth_id = auth.uid()
        AND gm_me.group_id = group_members.group_id
        AND gm_me.role = 'admin'
    )
  );

CREATE POLICY group_messages_select_policy ON group_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM users me
      JOIN group_members gm_me ON gm_me.user_id = me.id
      WHERE me.auth_id = auth.uid()
        AND gm_me.group_id = group_messages.group_id
    )
  );

CREATE POLICY group_messages_insert_policy ON group_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users me
      JOIN group_members gm_me ON gm_me.user_id = me.id
      WHERE me.auth_id = auth.uid()
        AND me.id = group_messages.user_id
        AND gm_me.group_id = group_messages.group_id
    )
  );
