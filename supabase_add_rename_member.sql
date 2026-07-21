-- メンバー名の編集機能追加
-- SupabaseのSQL Editorに貼り付けて実行してください

create or replace function rename_member(p_event_id uuid, p_member_id uuid, p_name text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if p_name is null or length(trim(p_name)) = 0 or length(p_name) > 50 then
    raise exception 'invalid member name';
  end if;
  if not exists (select 1 from members where id = p_member_id and event_id = p_event_id) then
    raise exception 'member not found';
  end if;
  if exists (select 1 from members
             where event_id = p_event_id and name = trim(p_name) and id <> p_member_id) then
    raise exception 'duplicate member name';
  end if;
  update members set name = trim(p_name)
    where id = p_member_id and event_id = p_event_id;
end $$;

grant execute on function rename_member(uuid, uuid, text) to anon;
