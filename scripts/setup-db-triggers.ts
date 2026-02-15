
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('Error: DATABASE_URL or DIRECT_URL is not set in .env');
    process.exit(1);
}

const client = new Client({
    connectionString: dbUrl,
});

async function setupTriggers() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // 1. Create Function to handle new user
        const createFunctionQuery = `
      create or replace function public.handle_new_user()
      returns trigger
      language plpgsql
      security definer set search_path = public
      as $$
      begin
        insert into public."Profile" (id, email, "firstName", "lastName", phone)
        values (
          new.id,
          new.email,
          new.raw_user_meta_data ->> 'first_name',
          new.raw_user_meta_data ->> 'last_name',
          new.raw_user_meta_data ->> 'phone'
        );
        return new;
      end;
      $$;
    `;

        await client.query(createFunctionQuery);
        console.log('Function public.handle_new_user() created/updated.');

        // 2. Create Trigger
        // First drop if exists to avoid errors on re-run
        await client.query(`drop trigger if exists on_auth_user_created on auth.users;`);

        const createTriggerQuery = `
      create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
    `;

        await client.query(createTriggerQuery);
        console.log('Trigger on_auth_user_created created.');

    } catch (err) {
        console.error('Error setting up triggers:', err);
    } finally {
        await client.end();
    }
}

setupTriggers();
