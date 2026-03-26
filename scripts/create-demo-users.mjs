import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testUsers = [
  {
    email: 'demo.admin@example.com',
    password: 'DemoAdmin123!',
    fullName: 'Admin Demo User',
    role: 'super_admin',
  },
  {
    email: 'demo.manager@example.com',
    password: 'DemoManager123!',
    fullName: 'Manager Demo User',
    role: 'admin',
  },
  {
    email: 'demo.user@example.com',
    password: 'DemoUser123!',
    fullName: 'Regular Demo User',
    role: 'manager',
  },
];

async function createDemoUsers() {
  console.log('Creating demo users...\n');

  for (const user of testUsers) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (authError) {
        console.error(`❌ Failed to create auth user ${user.email}:`, authError.message);
        continue;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: user.email,
            full_name: user.fullName,
            role: user.role,
            department: 'Demo',
            is_active: true,
          },
        ]);

      if (profileError) {
        console.error(`❌ Failed to create profile for ${user.email}:`, profileError.message);
        continue;
      }

      console.log(`✅ Created user: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role: ${user.role}`);
      console.log();
    } catch (error) {
      console.error(`❌ Error creating user ${user.email}:`, error);
    }
  }

  console.log('\n✅ Demo users creation complete!');
  console.log('\nYou can now sign in with any of the above credentials.');
}

createDemoUsers().catch(console.error);
