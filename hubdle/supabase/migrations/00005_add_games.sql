-- All game seed data in one place
insert into public.games (id, name, url, score_direction) values
  ('wordle', 'Wordle', 'https://www.nytimes.com/games/wordle', 'asc'),
  ('bandle', 'Bandle', 'https://bandle.app', 'asc'),
  ('connections', 'Connections', 'https://www.nytimes.com/games/connections', 'asc'),
  ('contexto', 'Contexto', 'https://contexto.me', 'asc'),
  ('scrandle', 'Scrandle', 'https://scrandle.com', 'desc')
on conflict (id) do nothing;
