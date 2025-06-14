'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState(10);
  const [canResend, setCanResend] = useState(false);

  // Debug helper  
  const addDebug = (message: string) => {
    console.log(message);
  };

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      const supabase = createClient();
      
      try {
        addDebug('Checking user authentication status...');
        
        // First, clear any old localStorage flags from previous tests
        const oldFlag = localStorage.getItem('email_confirmed');
        const oldTimestamp = localStorage.getItem('email_confirmed_timestamp');
        if (oldFlag || oldTimestamp) {
          addDebug(`Clearing old localStorage flags: ${oldFlag}, ${oldTimestamp}`);
          localStorage.removeItem('email_confirmed');
          localStorage.removeItem('email_confirmed_timestamp');
          localStorage.removeItem('email_confirmation_attempted');
        }
        
        // Get user info and email
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          addDebug(`Error getting user: ${userError.message}`);
          
          // "Auth session missing" is NORMAL for unconfirmed users - not an error!
          if (userError.message.includes('Auth session missing')) {
            addDebug('No session found - this is normal for unconfirmed email signup');
            // This is expected state - user signed up but hasn't confirmed email yet
            // We should show the "check your email" message, not an error
            setError(null); // Clear any error
            setIsLoading(false);
            return;
          }
          
          // Handle other session errors (corrupted JWT, etc.)
          if (userError.message.includes('JWT') || userError.message.includes('sub claim') || userError.message.includes('does not exist')) {
            addDebug('Clearing corrupted session...');
            await supabase.auth.signOut();
            setError('Your session has expired. Please sign up again.');
          } else {
            setError('Unable to check user status. Please try again.');
          }
          setIsLoading(false);
          return;
        }
        
        if (user?.email) {
          setUserEmail(user.email);
          addDebug(`User found: ${user.email}`);
          addDebug(`Email confirmed at: ${user.email_confirmed_at}`);
          addDebug(`User confirmed: ${user.confirmed_at}`);
          
          // Check if email is actually confirmed
          // Both email_confirmed_at and confirmed_at should be present for a fully confirmed user
          if (user.email_confirmed_at && user.confirmed_at) {
            addDebug('Email is confirmed! Redirecting to dashboard...');
            setEmailConfirmed(true);
            setTimeout(() => {
              router.push('/dashboard');
            }, 1000);
            return;
          } else {
            addDebug('Email not yet confirmed - waiting for user to click email link...');
            addDebug(`email_confirmed_at: ${user.email_confirmed_at}`);
            addDebug(`confirmed_at: ${user.confirmed_at}`);
          }
        } else {
          addDebug('No user found in session but no error - probably waiting for email confirmation');
          // This is also normal for fresh signups - show the check email message
        }

      } catch (err) {
        console.error('Error checking user status:', err);
        addDebug(`Error: ${err}`);
        setError('There was an error checking your account status.');
      } finally {
        setIsLoading(false);
      }
    };

    checkEmailConfirmation();
  }, [router]);

  // Listen for email confirmation from other tabs/windows
  useEffect(() => {
    addDebug('Setting up confirmation listeners...');
    
    const handleConfirmation = () => {
      addDebug('Email confirmation detected! Redirecting to dashboard...');
      setEmailConfirmed(true);
      
      // Clean up the localStorage flag
      localStorage.removeItem('email_confirmed');
      localStorage.removeItem('email_confirmed_timestamp');
      
      // Redirect to dashboard after brief delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    };

    // Method 1: Listen for localStorage changes (works across tabs)
    const handleStorageChange = (e: StorageEvent) => {
      addDebug(`Storage event: ${e.key} = ${e.newValue}`);
      if (e.key === 'email_confirmed' && e.newValue === 'true') {
        handleConfirmation();
      }
    };

    // Method 2: Listen for postMessage events (works for popups)
    const handleMessage = (event: MessageEvent) => {
      addDebug(`Received message: ${JSON.stringify(event.data)}`);
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'EMAIL_CONFIRMED' && event.data.success) {
        handleConfirmation();
      }
    };

    // Method 3: Listen for BroadcastChannel messages
    const channel = new BroadcastChannel('auth_channel');
    const handleBroadcast = (event: MessageEvent) => {
      addDebug(`Broadcast message: ${JSON.stringify(event.data)}`);
      if (event.data.type === 'EMAIL_CONFIRMED' && event.data.success) {
        handleConfirmation();
      }
    };

    // Method 4: Poll localStorage periodically (fallback)
    const pollForConfirmation = () => {
      const confirmed = localStorage.getItem('email_confirmed');
      const timestamp = localStorage.getItem('email_confirmed_timestamp');
      
      if (confirmed === 'true' && timestamp) {
        const timeDiff = Date.now() - parseInt(timestamp);
        addDebug(`Found confirmation flag: ${confirmed}, timestamp: ${timestamp}, age: ${timeDiff}ms`);
        
        // Only consider VERY recent confirmations (within last 30 seconds)
        // This prevents old stale flags from triggering
        if (timeDiff < 30 * 1000) {
          handleConfirmation();
        } else {
          addDebug(`Confirmation flag too old (${timeDiff}ms), ignoring...`);
          // Clean up old flags
          localStorage.removeItem('email_confirmed');
          localStorage.removeItem('email_confirmed_timestamp');
        }
      }
    };

    // Set up all listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('message', handleMessage);
    channel.addEventListener('message', handleBroadcast);
    
    // Check immediately in case confirmation happened before this page loaded
    pollForConfirmation();
    
    // Poll every 2 seconds as backup
    const pollInterval = setInterval(() => {
      addDebug('Polling for confirmation...');
      pollForConfirmation();
    }, 2000);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('message', handleMessage);
      channel.close();
      clearInterval(pollInterval);
    };
  }, [router]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0 && !canResend) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendCooldown === 0) {
      setCanResend(true);
    }
  }, [resendCooldown, canResend]);

  const handleResendEmail = async () => {
    if (!userEmail) {
      setError('Unable to resend email. Please try signing up again.');
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });

      if (error) throw error;

      // Show success message
      alert('Confirmation email sent! Please check your inbox.');
      
      // Reset cooldown timer
      setCanResend(false);
      setResendCooldown(10);
    } catch (err) {
      console.error('Resend email error:', err);
      setError('Failed to resend confirmation email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#C8FAFF]/40 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00818A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking email confirmation...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#C8FAFF]/40 to-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center">
          <Image
            src="/images/arx-logo.svg"
            alt="arx logo"
            width={120}
            height={40}
            priority
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center">
                {emailConfirmed ? (
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                ) : error ? (
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-[#C8FAFF] rounded-full flex items-center justify-center">
                    <Mail className="w-10 h-10 text-[#00818A]" />
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {emailConfirmed 
                  ? 'Email Confirmed!' 
                  : error 
                  ? 'Confirmation Error'
                  : 'Check Your Email'
                }
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {emailConfirmed ? (
                  'Your email has been successfully confirmed. Redirecting to your dashboard...'
                ) : error ? (
                  'There was a problem confirming your email address.'
                ) : (
                  <>
                    We&apos;ve sent a confirmation link to your email address.
                    <br />
                    Click the link in your email to verify your account.
                  </>
                )}
              </p>
            </CardHeader>

            <CardContent>
              {emailConfirmed ? (
                <div className="text-center">
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-[#00818A] hover:bg-[#00636a] text-white py-6 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              ) : error ? (
                <>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={() => window.location.reload()}
                      variant="outline"
                      className="w-full py-6 text-lg border-[#00818A] text-[#00818A] hover:bg-[#C8FAFF]/20"
                    >
                      Try Again
                    </Button>
                    
                    <div className="text-center">
                      <Link 
                        href="/signin" 
                        className="text-sm text-[#00818A] hover:underline"
                      >
                        Back to Sign In
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Didn&apos;t receive the email?</strong> Check your spam folder or click the button below to resend.
                    </p>
                    {userEmail && (
                      <p className="text-sm text-blue-600 mt-2">
                        Confirmation email will be sent to: <strong>{userEmail}</strong>
                      </p>
                    )}
                    <div className="mt-3 p-3 bg-blue-100 rounded border-l-4 border-blue-400">
                      <p className="text-xs text-blue-700">
                        <strong>💡 Tip:</strong> When you click the confirmation link in your email, 
                        it will open in a new tab. You can close that tab and return here - 
                        this page will automatically detect the confirmation and redirect you to your dashboard.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={handleResendEmail}
                      variant="outline"
                      disabled={!canResend || isLoading}
                      className="w-full py-6 text-lg border-[#00818A] text-[#00818A] hover:bg-[#C8FAFF]/20 disabled:opacity-50"
                    >
                      {!canResend ? `Resend Email (${resendCooldown}s)` : 'Resend Confirmation Email'}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Link 
                      href="/signin" 
                      className="text-sm text-[#00818A] hover:underline"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}