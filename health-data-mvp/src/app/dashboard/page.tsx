import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ContributorDashboard from './ContributorDashboard';

export default async function DashboardPage() {
  const supabase = createClient();
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/signin');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/signup');
  }

  // Fetch user's device connections
  const { data: connections } = await supabase
    .from('health_data_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('connection_status', 'active');

  return <ContributorDashboard 
    profile={profile} 
    connections={connections || []} 
  />;
}