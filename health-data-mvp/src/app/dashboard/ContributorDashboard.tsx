'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Heart, 
  Watch, 
  Plus,
  LogOut,
  Settings,
  Link2,
  Shield,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
}

interface Connection {
  id: string;
  device_type: string;
  device_id: string;
  connection_status: string;
  last_sync: string;
}

interface ContributorDashboardProps {
  profile: Profile;
  connections: Connection[];
}

const supportedDevices = [
  {
    id: 'apple-watch',
    name: 'Apple Watch',
    icon: Watch,
    description: 'Sync health data from your Apple Watch via Apple Health',
    status: 'available',
    color: 'text-gray-900'
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    icon: Activity,
    description: 'Connect your Fitbit device to share fitness metrics',
    status: 'available',
    color: 'text-blue-600'
  },
  {
    id: 'garmin',
    name: 'Garmin',
    icon: Watch,
    description: 'Import data from Garmin Connect',
    status: 'coming-soon',
    color: 'text-orange-600'
  },
  {
    id: 'whoop',
    name: 'WHOOP',
    icon: Heart,
    description: 'Sync recovery and strain data from WHOOP',
    status: 'coming-soon',
    color: 'text-red-600'
  }
];

export default function ContributorDashboard({ profile, connections }: ContributorDashboardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const hasConnectedDevices = connections.length > 0;

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      setIsLoading(false);
    }
  };

  const handleConnectDevice = (deviceId: string) => {
    // TODO: Implement actual device connection flow
    console.log('Connecting device:', deviceId);
    alert(`Device connection for ${deviceId} coming soon!`);
  };

  if (!hasConnectedDevices) {
    // Show device connection screen
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#C8FAFF]/20 to-white">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile.first_name}!</h1>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Card */}
            <Card className="mb-8 bg-gradient-to-r from-[#00818A] to-[#00636a] text-white">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Start Your Health Journey</h2>
                    <p className="text-white/90 mb-6">
                      Connect your device to start contributing to medical research
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <Sparkles className="w-24 h-24 text-white/20" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Devices */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-6">Connect Your Device</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {supportedDevices.map((device) => {
                  const Icon = device.icon;
                  return (
                    <Card 
                      key={device.id} 
                      className={`relative ${device.status === 'coming-soon' ? 'opacity-75' : 'hover:shadow-lg transition-shadow cursor-pointer'}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Icon className={`w-8 h-8 ${device.color}`} />
                              <h4 className="text-lg font-semibold">{device.name}</h4>
                              {device.status === 'coming-soon' && (
                                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{device.description}</p>
                            {device.status === 'available' && (
                              <Button 
                                onClick={() => handleConnectDevice(device.id)}
                                className="bg-[#00818A] hover:bg-[#00636a]"
                              >
                                <Link2 className="w-4 h-4 mr-2" />
                                Connect
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Your Privacy is Our Priority</p>
                <p className="text-sm text-blue-700">
                  All data is de-identified and encrypted. You can pause sharing or delete your data anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show connected devices dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C8FAFF]/20 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Contributor Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSignOut}
                disabled={isLoading}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Connected Devices */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
              <CardDescription>Manage your device connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {connections.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Watch className="w-6 h-6 text-gray-900" />
                      <div>
                        <p className="font-medium capitalize">{connection.device_type.replace('-', ' ')}</p>
                        <p className="text-sm text-gray-500">
                          Last synced: {new Date(connection.last_sync).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Device
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for future data visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Your Health Data</CardTitle>
              <CardDescription>Data visualization coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Health data charts will appear here once we start syncing your data</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}