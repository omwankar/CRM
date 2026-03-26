import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testUsers = [
  {
    email: 'admin@example.com',
    password: 'Admin123!@#',
    fullName: 'Admin User',
    phone: '+1-555-0101',
    role: 'super_admin',
    department: 'Administration',
  },
  {
    email: 'manager@example.com',
    password: 'Manager123!@#',
    fullName: 'Manager User',
    phone: '+1-555-0102',
    role: 'admin',
    department: 'Operations',
  },
  {
    email: 'user@example.com',
    password: 'User123!@#',
    fullName: 'Regular User',
    phone: '+1-555-0103',
    role: 'manager',
    department: 'Sales',
  },
  {
    email: 'demo@example.com',
    password: 'Demo123!@#',
    fullName: 'Demo User',
    phone: '+1-555-0104',
    role: 'manager',
    department: 'Support',
  },
];

async function createTestUsers() {
  console.log('Creating test users in Supabase...\n');

  for (const user of testUsers) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError.message);
        continue;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: user.email,
          full_name: user.fullName,
          phone: user.phone,
          role: user.role,
          department: user.department,
          is_active: true,
        });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError.message);
        continue;
      }

      console.log(`✓ Created user: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Role: ${user.role}`);
      console.log('');
    } catch (error) {
      console.error(`Unexpected error for ${user.email}:`, error);
    }
  }

  console.log('Test users creation complete!');
  process.exit(0);
}

createTestUsers();
