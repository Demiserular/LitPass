-- Enable Row Level Security
alter publication supabase_realtime enable;

-- Users table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Events table
create table public.events (
  id uuid default extensions.uuid_generate_v4() primary key,
  title text not null,
  description text,
  venue text,
  location jsonb,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  cover_image_url text,
  price numeric(10,2) default 0,
  capacity integer,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tickets table
create table public.tickets (
  id uuid default extensions.uuid_generate_v4() primary key,
  event_id uuid references public.events on delete cascade not null,
  user_id uuid references auth.users not null,
  ticket_number text unique not null,
  status text not null default 'active' check (status in ('active', 'used', 'cancelled')),
  qr_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, user_id)
);

-- Transactions table
create table public.transactions (
  id uuid default extensions.uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  event_id uuid references public.events,
  amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  payment_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Stories table
create table public.stories (
  id uuid default extensions.uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  event_id uuid references public.events,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.tickets enable row level security;
alter table public.transactions enable row level security;
alter table public.stories enable row level security;

-- Profiles policies
create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Events policies
create policy "Events are viewable by everyone"
  on public.events for select
  using (true);

create policy "Users can create events"
  on public.events for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update their own events"
  on public.events for update
  using (auth.uid() = created_by);

-- Tickets policies
create policy "Users can view their own tickets"
  on public.tickets for select
  using (auth.uid() = user_id);

create policy "Users can create tickets"
  on public.tickets for insert
  with check (auth.role() = 'authenticated');

-- Transactions policies
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can create transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

-- Stories policies
create policy "Users can view all active stories"
  on public.stories for select
  using (expires_at > now());

create policy "Users can create stories"
  on public.stories for insert
  with check (auth.uid() = user_id);

-- Create indexes for better performance
create index idx_events_created_by on public.events(created_by);
create index idx_tickets_user_id on public.tickets(user_id);
create index idx_tickets_event_id on public.tickets(event_id);
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_stories_expires_at on public.stories(expires_at);

-- Set up realtime
alter table public.events replica identity full;
alter table public.stories replica identity full;

-- Create a function to handle new user signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a function to get the current user's profile
create or replace function public.get_user_profile()
returns json as $$
  select json_build_object(
    'id', id,
    'email', email,
    'username', profiles.username,
    'full_name', profiles.full_name,
    'avatar_url', profiles.avatar_url
  )
  from auth.users
  left join public.profiles on auth.users.id = profiles.id
  where auth.uid() = auth.users.id;
$$ language sql security definer;
