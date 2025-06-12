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
    // Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
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

    // Update the profile with additional data
    const profileData = {
      first_name: data.firstName,
      last_name: data.lastName,
      date_of_birth: data.dateOfBirth,
      location: data.location,
      marketing_emails: data.marketingEmails,
      consent_data_sharing: data.agreeToDataSharing,
      display_name: `${data.firstName} ${data.lastName}`, // Add display_name for your existing schema
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      // Don't throw here as the user account was created successfully
    }

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