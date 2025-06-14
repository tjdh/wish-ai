import { createClient } from '@/lib/supabase/client'

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  dateOfBirth: string
  location: string
  agreeToTerms: boolean
  agreeToDataSharing: boolean
  marketingEmails: boolean
}

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function signUp(data: SignUpData) {
  const supabase = createClient()

  try {
    // Get the current domain for redirect URL
    const currentDomain = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000';

    // Sign up the user with Supabase Auth
    // The metadata will be available in the trigger via NEW.raw_user_meta_data
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${currentDomain}/email-confirmed`,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          date_of_birth: data.dateOfBirth,
          location: data.location,
          marketing_emails: data.marketingEmails,
          consent_data_sharing: data.agreeToDataSharing,
        }
      }
    })

    if (authError) {
      throw new AuthError(authError.message, authError.message)
    }

    if (!authData.user) {
      throw new AuthError('Failed to create user account')
    }

    // The trigger will handle creating/updating the profile
    
    return {
      user: authData.user,
      session: authData.session,
      needsEmailConfirmation: !authData.session
    }

  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    
    console.error('Signup error:', error)
    throw new AuthError('An unexpected error occurred during signup')
  }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new AuthError(error.message, error.message)
  }

  return data
}

export async function signOut() {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new AuthError(error.message)
  }
}

export async function getCurrentUser() {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  return session?.user ?? null
}

export async function getUserProfile(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw new AuthError(error.message)
  }

  return data
}