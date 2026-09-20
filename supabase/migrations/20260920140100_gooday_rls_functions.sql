-- =============================================================
-- Gooday — Helper functions + RLS policies
-- =============================================================

-- ---------- helpers ----------

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_following(p_follower uuid, p_following uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.follows
    WHERE follower_id = p_follower AND following_id = p_following
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id
      AND user_id = p_user_id
      AND status = 'ACTIVE'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(p_group_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id
      AND user_id = p_user_id
      AND status = 'ACTIVE'
      AND role IN ('OWNER', 'ADMIN')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_profile(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = p_user_id
      AND (
        NOT u.is_private
        OR u.id = auth.uid()
        OR public.is_following(auth.uid(), u.id)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_post(p_post_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.posts p
    LEFT JOIN public.group_posts gp ON gp.post_id = p.id
    LEFT JOIN public.groups g ON g.id = gp.group_id
    WHERE p.id = p_post_id
      AND p.deleted_at IS NULL
      AND (
        p.author_id = auth.uid()
        OR (
          p.audience = 'PUBLIC'
          AND public.can_view_profile(p.author_id)
          AND (gp.id IS NULL OR g.privacy = 'PUBLIC' OR public.is_group_member(g.id))
        )
        OR (
          p.audience = 'FOLLOWERS'
          AND (public.is_following(auth.uid(), p.author_id) OR p.author_id = auth.uid())
        )
        OR (
          p.audience = 'GROUP'
          AND gp.group_id IS NOT NULL
          AND public.is_group_member(gp.group_id)
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conversation_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id
      AND user_id = p_user_id
      AND left_at IS NULL
  );
$$;

-- Auto-create profile + settings when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_handle text;
  v_name text;
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_handle := lower(regexp_replace(
    COALESCE(NEW.raw_user_meta_data->>'handle', split_part(NEW.email, '@', 1)),
    '[^a-z0-9._]', '', 'g'
  ));
  IF v_handle = '' THEN
    v_handle := 'user_' || substr(replace(NEW.id::text, '-', ''), 1, 10);
  END IF;

  WHILE EXISTS (SELECT 1 FROM public.users WHERE handle = v_handle) LOOP
    v_handle := v_handle || floor(random() * 1000)::text;
  END LOOP;

  INSERT INTO public.users (id, name, handle, avatar_url)
  VALUES (
    NEW.id,
    v_name,
    v_handle,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.expire_stories()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  UPDATE public.stories
  SET status = 'EXPIRED'
  WHERE status = 'ACTIVE'
    AND expires_at < now()
    AND deleted_at IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_follow(p_target uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  existed boolean;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF uid = p_target THEN
    RAISE EXCEPTION 'cannot follow yourself';
  END IF;

  DELETE FROM public.follows
  WHERE follower_id = uid AND following_id = p_target
  RETURNING true INTO existed;

  IF existed THEN
    RETURN jsonb_build_object('following', false);
  END IF;

  INSERT INTO public.follows (follower_id, following_id)
  VALUES (uid, p_target);

  INSERT INTO public.notifications (recipient_id, actor_id, type)
  VALUES (p_target, uid, 'FOLLOW');

  RETURN jsonb_build_object('following', true);
END;
$$;
