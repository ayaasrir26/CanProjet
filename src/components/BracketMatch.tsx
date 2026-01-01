import { Tables } from "@/integrations/supabase/types";

interface BracketMatchProps {
  team1?: Tables<"teams"> | null;
  team2?: Tables<"teams"> | null;
  score1?: number | null;
  score2?: number | null;
  isWinner1?: boolean;
  isWinner2?: boolean;
  onScore1Change?: (score: number) => void;
  onScore2Change?: (score: number) => void;
  onTeam1Click?: () => void;
  onTeam2Click?: () => void;
  isPredicted1?: boolean;
  isPredicted2?: boolean;
}

export const BracketMatch = ({
  team1,
  team2,
  score1,
  score2,
  isWinner1,
  isWinner2,
  onScore1Change,
  onScore2Change,
  onTeam1Click,
  onTeam2Click,
  isPredicted1,
  isPredicted2
}: BracketMatchProps) => {
  return (
    <div className="relative min-w-[220px] sm:min-w-[260px] md:min-w-[280px] rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 group backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/70 border-2 border-white/40 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-400/60">

      {/* Team 1 */}
      <div
        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-4 transition-all duration-300 ${isPredicted1
          ? 'bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 border-l-4 border-purple-500 shadow-lg shadow-purple-500/20'
          : 'bg-white/50 hover:bg-gradient-to-r hover:from-purple-50/50 hover:via-white/50 hover:to-purple-50/50'
          } ${onTeam1Click ? 'cursor-pointer' : ''}`}
        onClick={onTeam1Click}
      >
        {team1 ? (
          <>
            <div className="relative">
              <img
                src={team1.flag_url || ''}
                alt={team1.name}
                className="w-10 h-7 sm:w-12 sm:h-8 object-cover rounded border border-gray-200"
              />
              {isPredicted1 && (
                <div className="absolute -inset-1 border-2 border-purple-500 rounded shadow-lg shadow-purple-500/50" />
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className={`font-bold text-base sm:text-lg leading-none ${isPredicted1 ? 'text-gray-900' : 'text-gray-700'
                }`}>
                {team1.code}
              </span>
              <span className="text-[11px] text-gray-500 uppercase tracking-wide font-medium truncate">
                {team1.name}
              </span>
            </div>
            {onScore1Change ? (
              <input
                type="number"
                min="0"
                value={score1 ?? 0}
                onChange={(e) => {
                  e.stopPropagation();
                  onScore1Change(parseInt(e.target.value) || 0);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-9 sm:w-12 sm:h-10 bg-white border-2 border-gray-200 rounded-lg text-center font-bold text-base sm:text-lg text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            ) : (
              <span className={`font-bold text-lg ${isWinner1 ? 'text-gray-900' : 'text-gray-400'
                }`}>
                {score1 ?? 0}
              </span>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 h-12 bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200">
            <span className="text-gray-300 transform -rotate-45">/</span>
          </div>
        )}
      </div>

      {/* Simple Divider */}
      <div className="h-px bg-gray-200" />

      {/* Team 2 */}
      <div
        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-4 transition-all duration-300 ${isPredicted2
          ? 'bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 border-l-4 border-purple-500 shadow-lg shadow-purple-500/20'
          : 'bg-white/50 hover:bg-gradient-to-r hover:from-purple-50/50 hover:via-white/50 hover:to-purple-50/50'
          } ${onTeam2Click ? 'cursor-pointer' : ''}`}
        onClick={onTeam2Click}
      >
        {team2 ? (
          <>
            <div className="relative">
              <img
                src={team2.flag_url || ''}
                alt={team2.name}
                className="w-10 h-7 sm:w-12 sm:h-8 object-cover rounded border border-gray-200"
              />
              {isPredicted2 && (
                <div className="absolute -inset-1 border-2 border-purple-500 rounded shadow-lg shadow-purple-500/50" />
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className={`font-bold text-base sm:text-lg leading-none ${isPredicted2 ? 'text-gray-900' : 'text-gray-700'
                }`}>
                {team2.code}
              </span>
              <span className="text-[11px] text-gray-500 uppercase tracking-wide font-medium truncate">
                {team2.name}
              </span>
            </div>
            {onScore2Change ? (
              <input
                type="number"
                min="0"
                value={score2 ?? 0}
                onChange={(e) => {
                  e.stopPropagation();
                  onScore2Change(parseInt(e.target.value) || 0);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-9 sm:w-12 sm:h-10 bg-white border-2 border-gray-200 rounded-lg text-center font-bold text-base sm:text-lg text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            ) : (
              <span className={`font-bold text-lg ${isWinner2 ? 'text-gray-900' : 'text-gray-400'
                }`}>
                {score2 ?? 0}
              </span>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 h-12 bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200">
            <span className="text-gray-300 transform -rotate-45">/</span>
          </div>
        )}
      </div>
    </div>
  );
};
