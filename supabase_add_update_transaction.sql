-- 取引の編集機能追加
-- SupabaseのSQL Editorに貼り付けて実行してください

create or replace function update_transaction(
  p_event_id uuid, p_tx_id uuid, p_category text, p_title text,
  p_payer_id uuid, p_amount integer, p_lines jsonb)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_sum bigint; v_bad integer;
begin
  if not exists (select 1 from transactions where id = p_tx_id and event_id = p_event_id) then
    raise exception 'transaction not found';
  end if;
  if p_category not in ('tatekae', 'loan', 'gamble') then
    raise exception 'invalid category';
  end if;
  if p_amount is null or p_amount < 0 or p_amount > 100000000 then
    raise exception 'invalid amount';
  end if;
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception 'invalid lines';
  end if;
  select coalesce(sum((l->>'delta')::bigint), 0) into v_sum
    from jsonb_array_elements(p_lines) l;
  if v_sum <> 0 then
    raise exception 'lines must sum to zero';
  end if;
  select count(*) into v_bad from jsonb_array_elements(p_lines) l
    where not exists (select 1 from members m
      where m.id = (l->>'member_id')::uuid and m.event_id = p_event_id);
  if v_bad > 0 then
    raise exception 'invalid member in lines';
  end if;
  if p_payer_id is not null and not exists (
    select 1 from members where id = p_payer_id and event_id = p_event_id) then
    raise exception 'invalid payer';
  end if;
  update transactions
    set category = p_category, title = left(p_title, 100),
        payer_id = p_payer_id, amount = p_amount, lines = p_lines
    where id = p_tx_id and event_id = p_event_id;
end $$;

grant execute on function
  update_transaction(uuid, uuid, text, text, uuid, integer, jsonb)
to anon;
