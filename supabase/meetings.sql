-- 16/10/2026 Meetings (owner-only): transcripts, AI summaries, action items per party. RLS ON with NO policies → only the server (service role) can read/write; partners and the browser anon key cannot.
create table if not exists meetings (id text primary key, held_at date, title text, participants text, tags text[] default '{}', source text, transcript text, summary jsonb, usage jsonb, created_at timestamptz default now());
create table if not exists meeting_actions (id text primary key, meeting_id text references meetings(id) on delete cascade, party text, owner text, task text, due date, status text default 'open', task_id text, created_at timestamptz default now(), done_at timestamptz);
create index if not exists meeting_actions_open on meeting_actions (status, party);
alter table meetings enable row level security;
alter table meeting_actions enable row level security;
