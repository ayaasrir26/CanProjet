import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { GroupStandings } from '@/components/GroupStandings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function Index() {
  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('group_name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // List of valid CAN 2025 team codes based on current standings
  const VALID_CODES = [
    'MAR', 'MLI', 'ZAM', 'COM', // Group A
    'EGY', 'ZAF', 'ANG', 'ZIM', // Group B
    'NGA', 'TUN', 'TAN', 'UGA', // Group C
    'SEN', 'COD', 'BEN', 'BOT', // Group D
    'ALG', 'BFA', 'SUD', 'EQG', // Group E
    'CIV', 'CMR', 'MOZ', 'GAB'  // Group F
  ];

  const groupedTeams = teams
    ?.filter(team => VALID_CODES.includes(team.code))
    .reduce((acc, team) => {
      // Normalize group name: strip "Group", trim, and force to Uppercase
      const groupName = team.group_name
        .replace(/Group\s+/i, '')
        .trim()
        .toUpperCase();

      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(team);

      // Sort teams within group: Points (DESC), then GD (DESC)
      acc[groupName].sort((a, b) => {
        if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
        return (b.goal_difference || 0) - (a.goal_difference || 0);
      });

      return acc;
    }, {} as Record<string, typeof teams>);

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <HeroSection />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">Tournament Groups</h2>
          <p className="text-muted-foreground">24 teams competing across 6 groups</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {groupedTeams && Object.entries(groupedTeams)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([groupName, groupTeams]) => (
                <GroupStandings key={groupName} groupName={groupName} teams={groupTeams || []} />
              ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>CAN 2025 Morocco • Africa Cup of Nations</p>
        </div>
      </footer>
    </div>
  );
}
