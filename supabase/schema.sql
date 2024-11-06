-- Create domains table
create table public.domains (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  domain text not null,
  verification_method text check (verification_method in ('dns', 'file')) not null,
  verification_token text not null,
  verification_status text check (verification_status in ('pending', 'verified', 'failed')) not null default 'pending',
  last_verified_at timestamp with time zone,
  last_health_check timestamp with time zone,
  is_healthy boolean default true,
  settings jsonb default '{"auto_sitemap_sync": false, "sitemap_urls": [], "auto_indexing": false, "indexing_frequency": "daily"}'::jsonb
);

-- Create domain health logs table
create table public.domain_health_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  domain_id uuid references public.domains(id) on delete cascade not null,
  status_code integer not null,
  response_time integer not null,
  is_healthy boolean not null,
  error_message text
);

-- Create indexes
create index domains_user_id_idx on public.domains(user_id);
create index domains_domain_idx on public.domains(domain);
create index domain_health_logs_domain_id_idx on public.domain_health_logs(domain_id);

-- Set up RLS (Row Level Security)
alter table public.domains enable row level security;
alter table public.domain_health_logs enable row level security;

-- Create policies
create policy "Users can view their own domains"
  on public.domains for select
  using (auth.uid() = user_id);

create policy "Users can insert their own domains"
  on public.domains for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own domains"
  on public.domains for update
  using (auth.uid() = user_id);

create policy "Users can delete their own domains"
  on public.domains for delete
  using (auth.uid() = user_id);

create policy "Users can view health logs for their domains"
  on public.domain_health_logs for select
  using (
    exists (
      select 1 from public.domains
      where domains.id = domain_health_logs.domain_id
      and domains.user_id = auth.uid()
    )
  );

create policy "Users can insert health logs for their domains"
  on public.domain_health_logs for insert
  with check (
    exists (
      select 1 from public.domains
      where domains.id = domain_health_logs.domain_id
      and domains.user_id = auth.uid()
    )
  );