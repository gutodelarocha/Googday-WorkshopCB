-- =============================================================
-- Gooday — Seed from app mocks
-- Demo password for all seeded accounts: GoodayDemo123!
-- Primary login: marcos@gooday.app
-- =============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper to upsert auth user + identity
CREATE OR REPLACE FUNCTION public._seed_auth_user(
  p_id uuid,
  p_email text,
  p_password text,
  p_name text,
  p_handle text,
  p_avatar text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    p_id,
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object('name', p_name, 'handle', p_handle, 'avatar_url', p_avatar),
    now(), now(), '', '', '', ''
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    p_id,
    jsonb_build_object('sub', p_id::text, 'email', p_email, 'email_verified', true),
    'email',
    p_id::text,
    now(), now(), now()
  )
  ON CONFLICT DO NOTHING;
END;
$$;
