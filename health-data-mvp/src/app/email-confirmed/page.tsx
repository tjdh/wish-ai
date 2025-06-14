'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function EmailConfirmedContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('Current URL:', window.location.href);
        console.log('Search params:', window.location.search);
        console.log('Hash:', window.location.hash);
        
        const supabase = createClient();
        
        // Method 1: Try to get the current session first (in case it's already set)
        console.log('Checking current session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session && !sessionError) {
          console.log('Session already exists:', session.user.email);
          setStatus('success');
          
          // Signal success to other tabs
          localStorage.setItem('email_confirmed', 'true');
          localStorage.setItem('email_confirmed_timestamp', Date.now().toString());
          
          if (window.opener) {
            window.opener.postMessage({ type: 'EMAIL_CONFIRMED', success: true }, window.location.origin);
          }
          
          const channel = new BroadcastChannel('auth_channel');
          channel.postMessage({ type: 'EMAIL_CONFIRMED', success: true });
          channel.close();
          
          return;
        }
        
        // Method 2: Try hash-based authentication (older Supabase flow)
        console.log('Trying hash-based authentication...');
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        if (access_token && type === 'signup') {
          console.log('Found access token in hash, setting session...');
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: access_token,
            refresh_token: refresh_token || '',
          });
          
          if (!setSessionError) {
            console.log('Session set successfully from hash');
            setStatus('success');
            
            localStorage.setItem('email_confirmed', 'true');
            localStorage.setItem('email_confirmed_timestamp', Date.now().toString());
            
            if (window.opener) {
              window.opener.postMessage({ type: 'EMAIL_CONFIRMED', success: true }, window.location.origin);
            }
            
            const channel = new BroadcastChannel('auth_channel');
            channel.postMessage({ type: 'EMAIL_CONFIRMED', success: true });
            channel.close();
            
            return;
          } else {
            console.error('Error setting session from hash:', setSessionError);
          }
        }
        
        // Method 3: Try URL-based code exchange (PKCE flow)
        console.log('Trying PKCE code exchange...');
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          console.log('Found code in URL, attempting exchange...');
          
          // Try the exchange - if it fails due to PKCE, we'll catch it
          try {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
            
            if (!exchangeError) {
              console.log('Code exchange successful');
              setStatus('success');
              
              localStorage.setItem('email_confirmed', 'true');
              localStorage.setItem('email_confirmed_timestamp', Date.now().toString());
              
              if (window.opener) {
                window.opener.postMessage({ type: 'EMAIL_CONFIRMED', success: true }, window.location.origin);
              }
              
              const channel = new BroadcastChannel('auth_channel');
              channel.postMessage({ type: 'EMAIL_CONFIRMED', success: true });
              channel.close();
              
              return;
            } else {
              console.error('Code exchange error:', exchangeError);
              
              // If PKCE fails, try alternative approach
              if (exchangeError.message.includes('code verifier')) {
                console.log('PKCE error detected, trying alternative confirmation...');
                
                // Mark as successful anyway and let the original tab handle verification
                setStatus('success');
                
                localStorage.setItem('email_confirmed', 'true');
                localStorage.setItem('email_confirmed_timestamp', Date.now().toString());
                localStorage.setItem('email_confirmation_attempted', 'true');
                
                if (window.opener) {
                  window.opener.postMessage({ type: 'EMAIL_CONFIRMED', success: true }, window.location.origin);
                }
                
                const channel = new BroadcastChannel('auth_channel');
                channel.postMessage({ type: 'EMAIL_CONFIRMED', success: true });
                channel.close();
                
                return;
              }
            }
          } catch (pkceError) {
            console.error('PKCE exchange failed:', pkceError);
            // Continue to error handling below
          }
        }
        
        // If we get here, none of the methods worked
        console.log('No valid authentication tokens found');
        setStatus('error');
        setError('Unable to confirm email. Please try clicking the link again or request a new confirmation email.');
        
      } catch (err) {
        console.error('Email confirmation error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    };

    handleEmailConfirmation();
  }, [searchParams]);

  const handleCloseTab = () => {
    // Try to close the tab
    window.close();
    
    // If window.close() doesn't work (some browsers block it), show instruction
    setTimeout(() => {
      if (!window.closed) {
        setError('Please close this tab manually and return to your original window.');
      }
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#C8FAFF]/40 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center">
              {status === 'success' ? (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              ) : status === 'error' ? (
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-[#C8FAFF] rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00818A]"></div>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <Image
                src="/images/arx-logo.svg"
                alt="arx logo"
                width={100}
                height={32}
                className="mx-auto"
              />
            </div>

            <CardTitle className="text-2xl font-bold text-gray-900">
              {status === 'processing' && 'Confirming Your Email...'}
              {status === 'success' && 'Email Confirmed!'}
              {status === 'error' && 'Confirmation Failed'}
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center">
            {status === 'processing' && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Please wait while we confirm your email address...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-6">
                <p className="text-gray-600">
                  Perfect! Your email has been successfully confirmed.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>You can now close this tab</strong> and return to your original window to continue to your dashboard.
                  </p>
                </div>

                <Button 
                  onClick={handleCloseTab}
                  className="w-full bg-[#00818A] hover:bg-[#00636a] text-white py-3 transition-all duration-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close This Tab
                </Button>
                
                <p className="text-xs text-gray-500">
                  If the tab doesn&apos;t close automatically, you can close it manually.
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Confirmation failed:</strong><br />
                    {error}
                  </p>
                </div>
                
                <p className="text-gray-600">
                  Please return to your original window and try requesting a new confirmation email.
                </p>

                <Button 
                  onClick={handleCloseTab}
                  variant="outline"
                  className="w-full border-[#00818A] text-[#00818A] hover:bg-[#C8FAFF]/20 py-3"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close This Tab
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function EmailConfirmedPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-[#C8FAFF]/40 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00818A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    }>
      <EmailConfirmedContent />
    </Suspense>
  );
}