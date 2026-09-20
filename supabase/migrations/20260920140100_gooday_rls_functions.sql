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

  -- Ensure unique handle
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

-- Expire stories past expires_at
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

-- Toggle follow
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

-- Toggle like on post
CREATE OR REPLACE FUNCTION public.toggle_like_post(p_post_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  existed boolean;
  author uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF NOT public.can_view_post(p_post_id) THEN RAISE EXCEPTION 'forbidden'; END IF;

  DELETE FROM public.likes
  WHERE user_id = uid AND post_id = p_post_id
  RETURNING true INTO existed;

  IF existed THEN
    RETURN jsonb_build_object('liked', false);
  END IF;

  INSERT INTO public.likes (user_id, post_id) VALUES (uid, p_post_id);
  SELECT author_id INTO author FROM public.posts WHERE id = p_post_id;
  IF author IS NOT NULL AND author <> uid THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, post_id)
    VALUES (author, uid, 'LIKE', p_post_id);
  END IF;
  RETURN jsonb_build_object('liked', true);
END;
$$;

-- Toggle bookmark
CREATE OR REPLACE FUNCTION public.toggle_bookmark(p_post_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  existed boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF NOT public.can_view_post(p_post_id) THEN RAISE EXCEPTION 'forbidden'; END IF;

  DELETE FROM public.bookmarks
  WHERE user_id = uid AND post_id = p_post_id
  RETURNING true INTO existed;

  IF existed THEN
    RETURN jsonb_build_object('bookmarked', false);
  END IF;

  INSERT INTO public.bookmarks (user_id, post_id) VALUES (uid, p_post_id);
  RETURN jsonb_build_object('bookmarked', true);
END;
$$;

-- Toggle reaction
CREATE OR REPLACE FUNCTION public.toggle_reaction(p_post_id uuid, p_emoji text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  existed boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF NOT public.can_view_post(p_post_id) THEN RAISE EXCEPTION 'forbidden'; END IF;

  DELETE FROM public.reactions
  WHERE user_id = uid AND post_id = p_post_id AND emoji = p_emoji
  RETURNING true INTO existed;

  IF existed THEN
    RETURN jsonb_build_object('reacted', false, 'emoji', p_emoji);
  END IF;

  INSERT INTO public.reactions (user_id, post_id, emoji) VALUES (uid, p_post_id, p_emoji);
  RETURN jsonb_build_object('reacted', true, 'emoji', p_emoji);
END;
$$;

-- Join / request group
CREATE OR REPLACE FUNCTION public.join_group(p_group_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  g privacy;
  st group_member_status;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT privacy INTO g FROM public.groups WHERE id = p_group_id AND deleted_at IS NULL;
  IF g IS NULL THEN RAISE EXCEPTION 'group not found'; END IF;

  st := CASE WHEN g = 'PRIVATE' THEN 'PENDING'::group_member_status ELSE 'ACTIVE'::group_member_status END;

  INSERT INTO public.group_members (group_id, user_id, role, status)
  VALUES (p_group_id, uid, 'MEMBER', st)
  ON CONFLICT (group_id, user_id) DO UPDATE
    SET status = EXCLUDED.status
  WHERE public.group_members.status <> 'BANNED';

  IF st = 'PENDING' THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, group_id)
    SELECT gm.user_id, uid, 'GROUP_REQUEST', p_group_id
    FROM public.group_members gm
    WHERE gm.group_id = p_group_id AND gm.role IN ('OWNER', 'ADMIN') AND gm.status = 'ACTIVE';
  END IF;

  RETURN jsonb_build_object('status', st);
END;
$$;

-- Get or create DM conversation
CREATE OR REPLACE FUNCTION public.get_or_create_dm(p_other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  conv_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF uid = p_other_user_id THEN RAISE EXCEPTION 'cannot DM yourself'; END IF;

  SELECT c.id INTO conv_id
  FROM public.conversations c
  JOIN public.conversation_participants a ON a.conversation_id = c.id AND a.user_id = uid AND a.left_at IS NULL
  JOIN public.conversation_participants b ON b.conversation_id = c.id AND b.user_id = p_other_user_id AND b.left_at IS NULL
  WHERE c.is_group = false
  LIMIT 1;

  IF conv_id IS NOT NULL THEN
    RETURN conv_id;
  END IF;

  INSERT INTO public.conversations (is_group) VALUES (false) RETURNING id INTO conv_id;
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (conv_id, uid), (conv_id, p_other_user_id);
  RETURN conv_id;
END;
$$;

-- Send message
CREATE OR REPLACE FUNCTION public.send_message(p_conversation_id uuid, p_body text, p_media_url text DEFAULT NULL)
RETURNS public.messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  msg public.messages;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF NOT public.is_conversation_participant(p_conversation_id, uid) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO public.messages (conversation_id, sender_id, body, media_url)
  VALUES (p_conversation_id, uid, p_body, p_media_url)
  RETURNING * INTO msg;

  UPDATE public.conversations SET updated_at = now() WHERE id = p_conversation_id;

  INSERT INTO public.notifications (recipient_id, actor_id, type, body)
  SELECT cp.user_id, uid, 'MESSAGE', left(p_body, 120)
  FROM public.conversation_participants cp
  WHERE cp.conversation_id = p_conversation_id
    AND cp.user_id <> uid
    AND cp.left_at IS NULL;

  RETURN msg;
END;
$$;
