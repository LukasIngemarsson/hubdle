insert into public.games (id, name, url, score_direction) values
  ('timeguessr', 'TimeGuessr', 'https://timeguessr.com', 'desc')
on conflict (id) do nothing;
