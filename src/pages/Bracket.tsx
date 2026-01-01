// file name: Bracket.tsx (updated)

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { TournamentBracket } from "@/components/TournamentBracket";
import { PrizesSection } from "@/components/PrizesSection";
import { Leaderboard } from "@/components/Leaderboard";


import { Loader2, Save, LogIn, Download } from "lucide-react";
import { useContext, useRef } from "react";
import html2canvas from "html2canvas";
import { PredictionContext } from "@/contexts/PredictionContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";


const Bracket = () => {
  const predictionContext = useContext(PredictionContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const componentRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (componentRef.current) {
      const canvas = await html2canvas(componentRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      const data = canvas.toDataURL('image/png');
      const link = document.createElement('a');

      if (typeof link.download === 'string') {
        link.href = data;
        link.download = 'mes-pronostics-can-2025.png';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(data);
      }
    }
  };

  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  if (!predictionContext) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { getPredictedChampion, savePredictions, isSaving } = predictionContext;
  const champion = getPredictedChampion();

  return (
    <div ref={componentRef} className="min-h-screen bg-transparent relative">
      <Header />


      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-hero overflow-hidden">
        {/* Moroccan Zellige Overlay */}
        {/* Moroccan Zellige Overlay */}
        <div
          className="absolute inset-0 zellige-pattern opacity-[0.08] pointer-events-none mix-blend-overlay"
          style={{ maskImage: 'radial-gradient(circle at center, transparent 30%, black 100%)', WebkitMaskImage: 'radial-gradient(circle at center, transparent 30%, black 100%)' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/90 pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 mb-10 animate-bounce-slow">
              <span className="w-2 h-2 bg-saffron rounded-full animate-pulse" />
              <p className="text-xs font-black text-saffron uppercase tracking-[0.5em]">L'Excellence du Foot Africain</p>
            </div>

            <h1 className="font-royal text-7xl md:text-9xl text-white mb-8 tracking-tighter leading-none [text-shadow:0_20px_40px_rgba(0,0,0,0.3)] drop-shadow-2xl">
              TABLEAU <span className="text-saffron text-glow-saffron">FINAL</span>
            </h1>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
              <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-saffron/50 hidden md:block" />
              <p className="text-white/80 text-xl font-medium max-w-2xl leading-relaxed font-sans">
                Plongez au cœur du Royaume du Maroc pour la <span className="text-saffron font-bold">CAN 2025</span>.
                Vivez chaque match, prédisez chaque victoire, marquez l'histoire.
              </p>
              <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-saffron/50 hidden md:block" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              {user ? (
                <Button
                  onClick={savePredictions}
                  disabled={isSaving}
                  className="btn-royal h-16 px-12 text-lg shadow-royal-emerald/30 group"
                >
                  {isSaving ? (
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                  ) : (
                    <Save className="w-6 h-6 mr-3 transition-transform group-hover:rotate-12" />
                  )}
                  Sauvegarder mon Destin
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  className="btn-royal h-16 px-12 text-lg shadow-royal-emerald/30"
                >
                  <LogIn className="w-6 h-6 mr-3" />
                  Entrer dans l'Arène
                </Button>
              )}

              <Button
                onClick={handleDownload}
                className="btn-royal h-16 px-12 text-lg shadow-royal-emerald/30 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-6 h-6 mr-3" />
                Télécharger
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Wave Bottom */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-[#f8f9fa]" />
      </section>

      <main className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : teams ? (
          <TournamentBracket teams={teams} />
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            Failed to load teams data
          </div>
        )}
      </main>

      <PrizesSection winner={champion} />
      <Leaderboard />

      {/* Sticky mobile save button */}
      {user && (
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <Button
            size="icon"
            className="w-14 h-14 rounded-full bg-secondary text-navy shadow-xl border-2 border-white/20"
            onClick={savePredictions}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          </Button>
          <Button
            size="icon"
            className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl border-2 border-white/20 mt-4"
            onClick={handleDownload}
          >
            <Download className="w-6 h-6" />
          </Button>
        </div>
      )}
      {/* Chatbot Removed */}
    </div>
  );
};

export default Bracket;
