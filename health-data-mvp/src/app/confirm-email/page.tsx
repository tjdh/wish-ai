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

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      const supabase = createClient();
      
      try {
        // First check URL for confirmation token - this takes priority
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (accessToken && type === 'signup') {
          // Email confirmed via link
          setEmailConfirmed(true);
          
          // Set up the session
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });

          if (sessionError) {
            throw sessionError;
          }

          // Redirect to dashboard after a brief delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
          return; // Exit early
        }

        // If no confirmation token in URL, check if user exists but don't redirect
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.email) {
          setUserEmail(user.email);
          
          // Check if email is already confirmed
          if (user.email_confirmed_at) {
            // Email is already confirmed, redirect to dashboard
            router.push('/dashboard');
            return;
          }
          // Otherwise, stay on this page and show the "check your email" message
        } else {
          // No user found, they might have been logged out or session expired
          // Stay on this page to show the confirmation message
        }

      } catch (err) {
        console.error('Email confirmation error:', err);
        setError('There was an error confirming your email. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkEmailConfirmation();
  }, [router]);

  const handleResendEmail = async () => {
    if (!userEmail) {
      alert('Please enter your email address to resend the confirmation.');
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
                    Please click the link to verify your account.
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
                  </div>

                  <div className="space-y-3">
                    {userEmail && (
                      <Button 
                        onClick={handleResendEmail}
                        variant="outline"
                        disabled={isLoading}
                        className="w-full py-6 text-lg border-[#00818A] text-[#00818A] hover:bg-[#C8FAFF]/20"
                      >
                        Resend Confirmation Email
                      </Button>
                    )}
                    
                    {!userEmail && (
                      <div className="space-y-2">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          className="w-full px-4 py-3 border rounded-lg"
                          onChange={(e) => setUserEmail(e.target.value)}
                        />
                        <Button 
                          onClick={handleResendEmail}
                          variant="outline"
                          disabled={!userEmail || isLoading}
                          className="w-full py-6 text-lg border-[#00818A] text-[#00818A] hover:bg-[#C8FAFF]/20"
                        >
                          Resend Confirmation Email
                        </Button>
                      </div>
                    )}
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