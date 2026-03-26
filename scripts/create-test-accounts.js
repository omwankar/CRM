const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testUsers = [
  {
    email: 'admin@demo.com',
    password: 'AdminDemo123!',
    full_name: 'Admin Demo User',
    role: 'super_admin',
    department: 'Administration',
  },
  {
    email: 'manager@demo.com',
    password: 'ManagerDemo123!',
    full_name: 'Manager Demo User',
    role: 'admin',
    department: 'Operations',
  },
  {
    email: 'user@demo.com',
    password: 'UserDemo123!',
    full_name: 'Regular Demo User',
    role: 'manager',
    department: 'Sales',
  },
];

async function createTestUsers() {
  console.log('Creating test user accounts...\n');

  for (const user of testUsers) {
    try {
      // Create auth user
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
        },
      });

      if (error) {
        console.error(`Failed to create user ${user.email}:`, error.message);
        continue;
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: user.email,
              full_name: user.full_name,
              role: user.role,
              department: user.department,
              is_active: true,
            },
          ]);

        if (profileError) {
          console.error(`Failed to create profile for ${user.email}:`, profileError.message);
        } else {
          console.log(`✓ Created user: ${user.email}`);
          console.log(`  Password: ${user.password}`);
          console.log(`  Role: ${user.role}`);
          console.log();
        }
      }
    } catch (err) {
      console.error(`Error creating user ${user.email}:`, err.message);
    }
  }

  console.log('\nTest users created successfully!');
  console.log('You can now sign in with these credentials at /auth/login');
}

createTestUsers().catch(console.error);
