'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, User, Mail, Lock, Calendar, MapPin, Heart, Activity } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  location: string;
  agreeToTerms: boolean;
  agreeToDataSharing: boolean;
  marketingEmails: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    location: '',
    agreeToTerms: false,
    agreeToDataSharing: false,
    marketingEmails: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    if (!formData.agreeToDataSharing) {
      newErrors.agreeToDataSharing = 'You must agree to data sharing for research';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    
    try {
      // Import the signUp function dynamically to avoid SSR issues
      const { signUp } = await import('@/lib/auth');
      
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        location: formData.location,
        agreeToTerms: formData.agreeToTerms,
        agreeToDataSharing: formData.agreeToDataSharing,
        marketingEmails: formData.marketingEmails,
      });

      if (result.needsEmailConfirmation) {
        // Redirect to email confirmation page
        window.location.href = '/confirm-email';
      } else {
        // User is immediately signed in, redirect to dashboard
        window.location.href = '/dashboard';
      }
      
    } catch (error: unknown) {
      console.error('Signup error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Handle specific auth errors
      if (errorMessage.includes('already registered')) {
        setErrors({ submit: 'An account with this email already exists. Please sign in instead.' });
      } else if (errorMessage.includes('Invalid email')) {
        setErrors({ submit: 'Please enter a valid email address.' });
      } else if (errorMessage.includes('Password should be at least')) {
        setErrors({ submit: 'Password must be at least 6 characters long.' });
      } else {
        setErrors({ submit: errorMessage || 'Something went wrong. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#C8FAFF]/40 to-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#00818A] hover:text-[#00636a] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
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
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#00818A]">
                Step {step} of 2
              </span>
              <span className="text-sm text-gray-500">
                {step === 1 ? 'Account Details' : 'Profile Setup'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#00818A] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-[#C8FAFF] rounded-full flex items-center justify-center">
                {step === 1 ? (
                  <User className="w-8 h-8 text-[#00818A]" />
                ) : (
                  <Heart className="w-8 h-8 text-[#00818A]" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {step === 1 ? 'Create Your Account' : 'Complete Your Profile'}
              </CardTitle>
              <p className="text-gray-600">
                {step === 1 
                  ? 'Join thousands contributing to health research' 
                  : 'Help us personalize your experience'
                }
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {step === 1 ? (
                <>
                  {/* Step 1: Account Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          placeholder="John"
                          className="pl-10"
                          value={formData.firstName}
                          onChange={(e) => updateFormData('firstName', e.target.value)}
                        />
                      </div>
                      {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          className="pl-10"
                          value={formData.lastName}
                          onChange={(e) => updateFormData('lastName', e.target.value)}
                        />
                      </div>
                      {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                      />
                    </div>
                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        className="pl-10"
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>

                  <Button 
                    onClick={handleNext}
                    className="w-full bg-[#00818A] hover:bg-[#00636a] text-white py-6 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    Continue
                  </Button>
                </>
              ) : (
                <>
                  {/* Step 2: Profile Setup */}
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        className="pl-10"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                      />
                    </div>
                    {errors.dateOfBirth && <p className="text-sm text-red-600">{errors.dateOfBirth}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        placeholder="City, State/Country"
                        className="pl-10"
                        value={formData.location}
                        onChange={(e) => updateFormData('location', e.target.value)}
                      />
                    </div>
                    {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
                  </div>

                  {/* Agreements */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => updateFormData('agreeToTerms', checked as boolean)}
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm leading-5">
                        I agree to the{' '}
                        <Link href="/terms" className="text-[#00818A] hover:underline">
                          Terms and Conditions
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-[#00818A] hover:underline">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    {errors.agreeToTerms && <p className="text-sm text-red-600 ml-7">{errors.agreeToTerms}</p>}

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeToDataSharing"
                        checked={formData.agreeToDataSharing}
                        onCheckedChange={(checked) => updateFormData('agreeToDataSharing', checked as boolean)}
                      />
                      <Label htmlFor="agreeToDataSharing" className="text-sm leading-5">
                        I consent to sharing my anonymized health data for research purposes
                      </Label>
                    </div>
                    {errors.agreeToDataSharing && <p className="text-sm text-red-600 ml-7">{errors.agreeToDataSharing}</p>}

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="marketingEmails"
                        checked={formData.marketingEmails}
                        onCheckedChange={(checked) => updateFormData('marketingEmails', checked as boolean)}
                      />
                      <Label htmlFor="marketingEmails" className="text-sm leading-5">
                        I would like to receive updates about research findings and platform news
                      </Label>
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 py-6 text-lg border-[#00818A] text-[#00818A] hover:bg-[#C8FAFF]/20"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="flex-1 bg-[#00818A] hover:bg-[#00636a] text-white py-6 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </div>
                </>
              )}

              {/* Sign In Link */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/signin" className="text-[#00818A] hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>256-bit SSL</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span>Privacy First</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}