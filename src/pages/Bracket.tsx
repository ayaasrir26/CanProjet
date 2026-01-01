import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { TournamentBracket } from "@/components/TournamentBracket";
import { PrizesSection } from "@/components/PrizesSection";
import { Leaderboard } from "@/components/Leaderboard";
import { Loader2, Save, LogIn, Trophy, Target, Users, Calendar, Download, RotateCcw } from "lucide-react";
import { useContext, useRef } from "react";
import html2canvas from "html2canvas";
import { PredictionContext } from "@/contexts/PredictionContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import html2canvas from 'html2canvas';

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

  const { getPredictedChampion, savePredictions, isSaving, clearPredictions } = predictionContext;

  const champion = getPredictedChampion();

  const championRef = useRef<HTMLDivElement>(null);

  const handleDownloadChampion = async () => {
    if (championRef.current) {
      const canvas = await html2canvas(championRef.current, {
        backgroundColor: null,
        scale: 2, // Higher quality
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = "champion-cAN-2025.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-white" ref={componentRef}>
      <Header />

      {/* Hero Section - Clean Modern Design */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">


            {/* Title Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-8">
                <div className="w-6 h-px bg-gradient-to-r from-transparent to-primary" />
                <Trophy className="w-8 h-8 text-primary animate-pulse" />
                <div className="w-6 h-px bg-gradient-to-l from-transparent to-primary" />
              </div>


              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  CAN 2025
                </span>
                <br />
                <span className="text-gray-900">Tournament Bracket</span>
              </h1>


              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Predict the journey to glory. Every match matters. Every prediction counts.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Your Prediction</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {champion ? champion.name : "Not set"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Active Predictors</p>
                      <p className="text-2xl font-bold text-gray-900">2,847</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <Calendar className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time Remaining</p>
                      <p className="text-2xl font-bold text-gray-900">14 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {user ? (
                <>
                  <Button
                    onClick={savePredictions}
                    disabled={isSaving}
                    className="h-12 px-8 text-base font-medium rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-3" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-3" />
                        Save Predictions
                      </>
                    )}
                  </Button>

                  {champion && (
                    <Button
                      onClick={handleDownloadChampion}
                      className="h-12 px-8 text-base font-medium rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <Download className="w-5 h-5 mr-3" />
                      Télécharger le Résultat
                    </Button>
                  )}


                  <Button
                    onClick={() => {
                      if (window.confirm("Êtes-vous sûr de vouloir réinitialiser toutes vos prédictions ?")) {
                        clearPredictions();
                      }
                    }}
                    variant="ghost"
                    className="h-12 px-8 text-base font-medium rounded-full hover:bg-red-50 hover:text-red-600 transition-all text-gray-500"
                  >
                    <RotateCcw className="w-5 h-5 mr-3" />
                    Réinitialiser
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  className="h-12 px-8 text-base font-medium rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <LogIn className="w-5 h-5 mr-3" />
                  Sign in to Predict
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

            {/* Instructions */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Play</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="w-8 h-8 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <p className="text-gray-600">Click on match winners</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-8 h-8 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <p className="text-gray-600">Predict the champion</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-8 h-8 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <p className="text-gray-600">Save and compete</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Bracket Section */}
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Tournament Bracket</h2>
            <div className="text-sm text-gray-500">
              {teams?.length || 0} teams competing
            </div>
          </div>


          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-gray-600">Loading tournament data...</p>
              </div>
            </div>
          ) : teams ? (
            <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 md:p-6 shadow-sm">
              <TournamentBracket teams={teams} />
            </div>
          ) : (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="py-20 text-center">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Failed to load teams data</p>
                <Button
                  variant="outline"
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Prizes Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-8 md:py-16">
        <PrizesSection winner={champion} />
      </div>

      {/* Leaderboard */}
      <div className="py-8 md:py-16">
        <Leaderboard />
      </div>

      {/* Floating Action Button for Mobile */}
      {user && (
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <Button
            size="icon"
            className="w-14 h-14 rounded-full bg-primary text-white shadow-xl hover:shadow-2xl transition-all duration-300 animate-bounce"
            onClick={savePredictions}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Save className="w-6 h-6" />
            )}
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
      {/* Hidden Champion Card for Capture */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        {champion && (
          <div
            ref={championRef}
            className="flex flex-col items-center p-12 bg-white rounded-3xl"
            style={{ width: "600px" }}
          >
            {/* Modern Gradient Trophy Circle */}
            <div className="relative mb-8">
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-purple-500/40">
                <div className="w-60 h-60 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center overflow-hidden border-4 border-white/20">
                  {champion.flag_url ? (
                    <img
                      src={champion.flag_url}
                      alt={champion.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Trophy className="w-32 h-32 text-white drop-shadow-2xl" strokeWidth={2.5} />
                  )}
                </div>
              </div>

              {/* Label above */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xl text-gray-800 uppercase tracking-[0.4em] font-bold bg-white/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg border border-purple-100">
                  Finale CAN 2025
                </span>
              </div>
            </div>

            {/* Champion Label */}
            <div className="text-center">
              <p className="text-lg text-purple-600 uppercase tracking-[0.3em] font-bold mb-4">
                Champion
              </p>
              <h2 className="text-7xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 bg-clip-text text-transparent uppercase tracking-tight">
                {champion.name}
              </h2>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 w-full text-center">
              <p className="text-gray-400 font-medium tracking-widest text-sm">PRÉDICTION OFFICIELLE</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bracket;