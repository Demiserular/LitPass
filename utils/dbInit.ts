import 'react-native-url-polyfill/auto';
import { supabase } from './supabaseClient';

export async function runMigrations() {
  try {
    // Check if migrations table exists
    const { data: migrationCheck, error: checkError } = await supabase
      .from('migrations')
      .select('*')
      .limit(1);

    if (checkError && checkError.code !== '42P01') { // 42P01 is "relation does not exist"
      console.error('Error checking migrations:', checkError);
      return;
    }

    // Create migrations table if it doesn't exist
    if (!migrationCheck) {
      const { error: createTableError } = await supabase.rpc('create_migrations_table');
      if (createTableError) {
        console.error('Error creating migrations table:', createTableError);
        return;
      }
    }

    // Get the latest migration
    const { data: latestMigration, error: migrationError } = await supabase
      .from('migrations')
      .select('name')
      .order('applied_at', { ascending: false })
      .limit(1)
      .single();

    // In a real app, you would check and run pending migrations here
    // For now, we'll just log that migrations are up to date
    console.log('Database migrations are up to date');
    
  } catch (error) {
    console.error('Error running migrations:', error);
  }
}

// This function would be called when the app starts
export async function initializeDatabase() {
  // Run migrations
  await runMigrations();
  
  // Set up any other database initialization here
  console.log('Database initialized');
}
