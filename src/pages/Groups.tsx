import { Header } from '@/components/Header';
import { GroupStandings } from '@/components/GroupStandings';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function Groups() {
  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase.from('teams').select('*').order('group_name').order('name');
      if (error) throw error;
      return data;
    },
  });

  const groupedTeams = teams?.reduce((acc, team) => {
    if (!acc[team.group_name]) acc[team.group_name] = [];
    acc[team.group_name].push(team);
    return acc;
  }, {} as Record<string, typeof teams>);

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl text-foreground mb-2">All Groups</h1>
          <p className="text-muted-foreground">CAN 2025 Morocco • 24 Teams</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedTeams && Object.entries(groupedTeams).map(([groupName, groupTeams]) => (
              <GroupStandings key={groupName} groupName={groupName} teams={groupTeams || []} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
