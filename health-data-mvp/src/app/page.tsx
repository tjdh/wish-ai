import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3 } from "lucide-react";
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="relative flex-1 bg-gradient-to-b from-sky-50 to-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Your Data, Your Choice
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Connect your wearable, contribute to science, and earn rewards while controlling exactly what you share.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-6 text-lg">Get Started</Button>
            </Link>
            <Link href="#researchers">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">For Researchers</Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="contributors" className="container mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold mb-8 text-center">For Contributors</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <ArrowRight className="w-8 h-8 mb-4" />
              <CardTitle>Link Your Device</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              Connect Apple Watch or Fitbit in two clicks. You decide what metrics to share.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <BarChart3 className="w-8 h-8 mb-4" />
              <CardTitle>Earn Points Daily</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              Steps, heart rate, sleep—anything you share can be redeemed for amazing rewards.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <ArrowRight className="w-8 h-8 mb-4" />
              <CardTitle>Stay in Control</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              Pause sharing anytime. Delete your data with one click—no questions asked.
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="researchers" className="bg-gray-50">
        <div className="container mx-auto px-4 py-24">
          <h2 className="text-3xl font-bold mb-8 text-center">For Researchers</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1 space-y-6">
              <h3 className="text-xl font-semibold">Quality, Consent‑backed Datasets</h3>
              <p className="text-gray-600">
                Access de‑identified, longitudinal wearable data with explicit participant consent and intelligent metadata uncovered by AI.
              </p>
              <h3 className="text-xl font-semibold">Flexible Licensing</h3>
              <p className="text-gray-600">
                Our dynamic pricing model means you pay only for what you need. You decide how much and how long.
              </p>
              <Link href="/researchers">
                <Button size="lg" className="mt-4">Request Access</Button>
              </Link>
            </div>
            <div className="flex-1">
              <Image src="/images/dashboard.png" width={600} height={400} alt="Researcher dashboard" className="rounded-2xl shadow-xl" />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-10">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Wish AI. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
