-- Enable RLS on the domains table
alter table public.domains enable row level security;

-- Create policy to allow users to insert their own domains
create policy "Users can insert their own domains"
on public.domains for insert
to authenticated
with check (auth.uid() = user_id);

-- Create policy to allow users to view their own domains
create policy "Users can view their own domains"
on public.domains for select
to authenticated
using (auth.uid() = user_id);

-- Create policy to allow users to update their own domains
create policy "Users can update their own domains"
on public.domains for update
to authenticated
using (auth.uid() = user_id);

-- Create policy to allow users to delete their own domains
create policy "Users can delete their own domains"
on public.domains for delete
to authenticated
using (auth.uid() = user_id); 