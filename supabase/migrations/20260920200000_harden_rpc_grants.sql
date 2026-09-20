-- Harden RPC grants: authenticated-only for app actions
REVOKE ALL ON FUNCTION public.get_home_feed(integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_home_feed(integer, integer) TO authenticated;

REVOKE ALL ON FUNCTION public.create_post(text, post_audience, uuid, text[], text[], text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_post(text, post_audience, uuid, text[], text[], text[]) TO authenticated;

REVOKE ALL ON FUNCTION public.toggle_like_post(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.toggle_like_post(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.toggle_bookmark(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.toggle_bookmark(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.toggle_reaction(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.toggle_reaction(uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.create_comment(uuid, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_comment(uuid, text, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.create_story(text, media_type) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_story(text, media_type) TO authenticated;

REVOKE ALL ON FUNCTION public.search_gooday(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_gooday(text, integer) TO authenticated;

REVOKE ALL ON FUNCTION public.toggle_follow(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.toggle_follow(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.join_group(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_group(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_or_create_dm(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_dm(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.send_message(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_message(uuid, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.mark_notifications_read(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_notifications_read(uuid[]) TO authenticated;
