import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection successful',
      data
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}