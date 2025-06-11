'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3 } from "lucide-react";

/**
 * Landing page themed around the "arx" brand colours:
 *  - Accent: #C8FAFF  (mint‑cyan)
 *  - Accent‑dark: #00818A
 * Light‑mode implementation only; dark mode can be added later.
 */
export default function LandingPage() {
  // Easing function for smooth acceleration and deceleration
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };
  
  // Faster easing with steeper acceleration/deceleration
  const easeInOutQuart = (t: number): number => {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
  };

  // Reference to store animation frame ID
  let scrollAnimationId: number | null = null;

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    // Cancel any existing animation
    if (scrollAnimationId) {
      cancelAnimationFrame(scrollAnimationId);
      scrollAnimationId = null;
    }
    
    const element = document.getElementById(targetId);
    if (!element) return;

    const startPosition = window.pageYOffset;
    const elementRect = element.getBoundingClientRect();
    const elementTop = elementRect.top + startPosition;
    
    // More robust calculation of document height
    const body = document.body;
    const html = document.documentElement;
    const documentHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    
    const windowHeight = window.innerHeight;
    const maxScrollPosition = Math.max(0, documentHeight - windowHeight);
    
    // If we want to scroll to elementTop, but max we can scroll is maxScrollPosition
    const targetPosition = Math.min(elementTop, maxScrollPosition);
    const distance = targetPosition - startPosition;
    
    // Don't animate if distance is too small or we're already there
    if (Math.abs(distance) < 1) return;
    
    const duration = 1200;
    let startTime: number | null = null;

    // Function to cancel the scroll animation
    const cancelScrollAnimation = () => {
      if (scrollAnimationId) {
        cancelAnimationFrame(scrollAnimationId);
        scrollAnimationId = null;
        // Remove the wheel listener once animation is cancelled
        window.removeEventListener('wheel', cancelScrollAnimation);
      }
    };

    // Add wheel event listener to detect user scroll
    window.addEventListener('wheel', cancelScrollAnimation, { passive: true });

    const performScroll = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }
      
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply easing to progress
      const easedProgress = easeInOutQuart(progress);
      
      // Calculate new position
      const currentTargetPosition = startPosition + (distance * easedProgress);
      
      // Scroll to the new position
      window.scrollTo({
        top: currentTargetPosition,
        behavior: 'auto' // Use auto to avoid conflicts
      });
      
      // Check if animation should continue
      if (progress < 1) {
        scrollAnimationId = requestAnimationFrame(performScroll);
      } else {
        scrollAnimationId = null;
        // Remove the wheel listener when animation completes naturally
        window.removeEventListener('wheel', cancelScrollAnimation);
      }
    };

    scrollAnimationId = requestAnimationFrame(performScroll);
  };

  return (
    <main className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Hero banner */}
      <section className="relative flex-1 bg-gradient-to-b from-[#C8FAFF]/40 to-white">
        <div className="container mx-auto px-4 py-20 text-center flex flex-col items-center gap-8">
          <Image
            src="/images/arx-logo.svg"
            alt="arx logo"
            width={180}
            height={64}
            priority
          />

          <h1 className="text-5xl font-extrabold tracking-tight max-w-3xl">
            Your Data, Your Choice
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Connect your wearable, contribute to science, and earn rewards while controlling exactly what you share.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button
                size="lg"
                className="px-8 py-6 text-lg font-semibold bg-[#C8FAFF] text-gray-900 hover:bg-[#9be9ef]"
              >
                Get Started
              </Button>
            </Link>
            <Link href="#researchers" onClick={(e) => scrollToSection(e, 'researchers')}>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg border-2 border-[#00818A] text-[#00818A] hover:bg-[#C8FAFF]/20"
              >
                For Researchers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contributors */}
      <section id="contributors" className="container mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold mb-12 text-center text-[#00818A]">Contributors</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <ArrowRight className="w-8 h-8 mb-4 text-[#00818A]" />
              <CardTitle>Link Your Device</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              Connect Apple Watch or Fitbit in two clicks. You decide what metrics to share.
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <BarChart3 className="w-8 h-8 mb-4 text-[#00818A]" />
              <CardTitle>Earn Points Daily</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              Steps, heart rate, sleep—anything you share can be redeemed for amazing rewards.
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <ArrowRight className="w-8 h-8 mb-4 text-[#00818A]" />
              <CardTitle>Stay in Control</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              Pause sharing anytime. Delete your data with one click—no questions asked.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Researchers */}
      <section id="researchers" className="bg-[#C8FAFF]/20">
        <div className="container mx-auto px-4 py-24">
          <h2 className="text-3xl font-bold mb-12 text-center text-[#00818A]">Researchers</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1 space-y-6">
              <h3 className="text-xl font-semibold">Quality, Consent‑backed Datasets</h3>
              <p className="text-gray-700">
                Access de‑identified, longitudinal wearable data with explicit participant consent and intelligent metadata uncovered by AI.
              </p>
              <h3 className="text-xl font-semibold">Flexible Licensing</h3>
              <p className="text-gray-700">
                Our dynamic pricing model means you pay only for what you need. You decide how much and how long.
              </p>
              <Link href="/researchers">
                <Button
                  size="lg"
                  className="mt-4 bg-[#00818A] hover:bg-[#00636a] text-white px-8 py-6"
                >
                  Request Access
                </Button>
              </Link>
            </div>
            <div className="flex-1">
              <Image
                src="/images/dashboard.png"
                width={600}
                height={400}
                alt="Researcher dashboard"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-10 bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} arx. All rights reserved.
        </div>
      </footer>
    </main>
  );
}