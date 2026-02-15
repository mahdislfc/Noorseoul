require("dotenv").config();
const { Client } = require("pg");

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("Error: DATABASE_URL or DIRECT_URL is not set in .env");
  process.exit(1);
}

const client = new Client({ connectionString: dbUrl });

const functionSql = `
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fallback_email text;
begin
  if to_regclass('public."Profile"') is null then
    raise warning 'Profile table not found. Skipping profile creation for user %', new.id;
    return new;
  end if;

  fallback_email := coalesce(
    new.email,
    new.raw_user_meta_data ->> 'email',
    concat(new.id::text, '@placeholder.local')
  );

  begin
    insert into public."Profile" (id, email, "firstName", "lastName", phone)
    values (
      new.id,
      fallback_email,
      new.raw_user_meta_data ->> 'first_name',
      new.raw_user_meta_data ->> 'last_name',
      new.raw_user_meta_data ->> 'phone'
    )
    on conflict (id) do update
    set
      email = excluded.email,
      "firstName" = coalesce(excluded."firstName", public."Profile"."firstName"),
      "lastName" = coalesce(excluded."lastName", public."Profile"."lastName"),
      phone = coalesce(excluded.phone, public."Profile".phone),
      "updatedAt" = now();
  exception
    when undefined_column then
      insert into public."Profile" (id, email, "firstName", "lastName", phone)
      values (
        new.id,
        fallback_email,
        new.raw_user_meta_data ->> 'first_name',
        new.raw_user_meta_data ->> 'last_name',
        new.raw_user_meta_data ->> 'phone'
      )
      on conflict (id) do nothing;
    when unique_violation then
      raise warning 'Email conflict while creating profile for auth user % (email: %)', new.id, fallback_email;
      insert into public."Profile" (id, email, "firstName", "lastName", phone)
      values (
        new.id,
        concat(new.id::text, '@placeholder.local'),
        new.raw_user_meta_data ->> 'first_name',
        new.raw_user_meta_data ->> 'last_name',
        new.raw_user_meta_data ->> 'phone'
      )
      on conflict (id) do nothing;
    when others then
      raise warning 'Profile insert failed for auth user %: %', new.id, sqlerrm;
  end;

  return new;
exception
  when others then
    raise warning 'handle_new_user failed for auth user %: %', new.id, sqlerrm;
    return new;
end;
$$;
`;

const triggerSql = `
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
`;

const backfillSql = `
insert into public."Profile" (id, email, "firstName", "lastName", phone)
select
  u.id,
  coalesce(
    u.email,
    u.raw_user_meta_data ->> 'email',
    concat(u.id::text, '@placeholder.local')
  ) as email,
  u.raw_user_meta_data ->> 'first_name' as "firstName",
  u.raw_user_meta_data ->> 'last_name' as "lastName",
  u.raw_user_meta_data ->> 'phone' as phone
from auth.users u
left join public."Profile" p on p.id::text = u.id::text
where p.id is null
on conflict (id) do nothing;
`;

async function main() {
  try {
    await client.connect();
    console.log("Connected to database.");

    await client.query(functionSql);
    console.log("Updated function: public.handle_new_user()");

    await client.query(triggerSql);
    console.log("Recreated trigger: auth.users -> public.handle_new_user()");

    if (process.argv.includes("--backfill")) {
      if (process.argv.includes("--skip-backfill")) {
        console.log("Skipping backfill due to conflicting flags.");
      } else {
        await client.query(backfillSql);
        console.log("Backfilled missing Profile rows from auth.users.");
      }
    }
  } catch (error) {
    console.error("Failed to apply auth trigger fix.");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
