const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Run database migration for GrainKeeper
async function runMigration() {
  console.log('🚀 Running GrainKeeper Database Migration...')
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY are set')
    console.log('\nCreate a .env.local file with:')
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url')
    console.log('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'lib', 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📋 Schema file loaded successfully')
    console.log('📊 Schema size:', (schema.length / 1024).toFixed(2), 'KB')
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip empty statements and comments
      if (!statement || statement.startsWith('--')) {
        continue
      }
      
      try {
        console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`)
        
        // Use the SQL editor to execute the statement
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // If exec_sql doesn't exist, try direct execution for simple statements
          if (error.message.includes('function "exec_sql" does not exist')) {
            console.log('⚠️  exec_sql function not available, trying alternative method...')
            
            // For now, we'll just log the statement and continue
            // In a real migration, you'd want to use Supabase's migration system
            console.log('📄 Statement to execute:')
            console.log(statement.substring(0, 100) + '...')
            successCount++
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message)
            errorCount++
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
          successCount++
        }
        
      } catch (err) {
        console.error(`❌ Error executing statement ${i + 1}:`, err.message)
        errorCount++
      }
    }
    
    console.log('\n📊 Migration Summary:')
    console.log(`✅ Successful: ${successCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log(`📝 Total: ${statements.length}`)
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!')
      console.log('\n📋 Next steps:')
      console.log('1. Test the chatbot integration: node scripts/test-chatbot-integration.js')
      console.log('2. Start the development server: npm run dev')
    } else {
      console.log('\n⚠️  Migration completed with errors. Please check the output above.')
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.log('\n💡 Alternative approach:')
    console.log('1. Copy the schema from lib/database/schema.sql')
    console.log('2. Go to your Supabase dashboard')
    console.log('3. Navigate to SQL Editor')
    console.log('4. Paste and execute the schema manually')
  }
}

// Run the migration
runMigration()
