import { useState, ReactNode, useEffect, useCallback } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { PredictionContext, PredictionMatch } from '../contexts/PredictionContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

const tablesMissing = {
    predictions: false
};

export function BracketPredictionProvider({ children }: { children: ReactNode }) {
    const [predictions, setPredictions] = useState<Record<string, PredictionMatch>>({});
    const [isSaving, setIsSaving] = useState(false);
    const { user } = useAuth();

    // Fetch user predictions if logged in
    useEffect(() => {
        const fetchPredictions = async () => {
            // 0. Skip if we validly know the table is missing
            if (tablesMissing.predictions) return;

            // 1. Priorité au localStorage pour un chargement instantané
            const localSaved = localStorage.getItem('can2025_predictions');
            if (localSaved) {
                try {
                    setPredictions(JSON.parse(localSaved));
                } catch (e) {
                    console.error('Failed to parse local predictions', e);
                }
            }

            if (!user) return;

            // 2. Synchronisation avec Supabase si possible
            try {
                const { data, error } = await supabase
                    .from('predictions' as any)
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (error) {
                    const isTableMissing =
                        error.code === 'PGRST205' ||
                        error.code === '42P01' ||
                        error.message?.includes('schema cache') ||
                        error.message?.includes('Could not find the table');

                    if (isTableMissing) {
                        tablesMissing.predictions = true; // Mark as missing globally
                        // Suppress log for cleaner console
                        // console.warn('Predictions table missing (sync disabled).');
                        return;
                    }
                    console.log('Skipping remote sync:', error.message);
                    return;
                }

                if (data && (data as any).bracket_data) {
                    const remoteData = (data as any).bracket_data as Record<string, PredictionMatch>;
                    setPredictions(remoteData);
                    localStorage.setItem('can2025_predictions', JSON.stringify(remoteData));
                }
            } catch (err: any) {
                // Suppress missing table errors
                if (err.code === 'PGRST205' || err.code === '42P01' || err.message?.includes('schema cache')) {
                    tablesMissing.predictions = true;
                    // console.warn('Predictions table missing (sync disabled).');
                } else {
                    console.error('Err fetching from supabase:', err);
                }
            }
        };

        fetchPredictions();
    }, [user]);

    // Sauvegarde auto dans localStorage à chaque changement
    useEffect(() => {
        if (Object.keys(predictions).length > 0) {
            localStorage.setItem('can2025_predictions', JSON.stringify(predictions));
        }
    }, [predictions]);

    const setPrediction = (matchId: string, winner: Tables<'teams'>) => {
        setPredictions(prev => ({
            ...prev,
            [matchId]: {
                ...prev[matchId],
                id: matchId,
                predictedWinner: winner,
            },
        }));
    };

    const setScore = (matchId: string, score1: number | null, score2: number | null) => {
        setPredictions(prev => ({
            ...prev,
            [matchId]: {
                ...prev[matchId],
                id: matchId,
                score1,
                score2,
            },
        }));
    };

    const getWinner = (matchId: string, t1: Tables<"teams"> | null, t2: Tables<"teams"> | null) => {
        const match = predictions[matchId];
        if (!match || !t1 || !t2) return null;
        if (match.score1 === null || match.score2 === null) return null;

        if (match.score1 > match.score2) return t1;
        if (match.score2 > match.score1) return t2;

        return match.predictedWinner || null;
    };

    const clearPredictions = () => {
        setPredictions({});
    };

    const calculatePathToFinal = (teamCode: string): string[] => {
        const path: string[] = [teamCode];
        // This would be calculated based on bracket structure
        return path;
    };

    const getPredictedChampion = useCallback((): Tables<'teams'> | null => {
        const finalMatch = predictions['final'];
        if (!finalMatch) return null;

        // Fix: If a winner is explicitly selected, return it immediately.
        // We don't need team1/team2 (which might be missing in state) to know the winner.
        if (finalMatch.predictedWinner) {
            return finalMatch.predictedWinner;
        }

        return getWinner('final', finalMatch.team1 || null, finalMatch.team2 || null);
    }, [predictions]);

    const savePredictions = async (): Promise<void> => {
        // Sauvegarde locale forcée
        localStorage.setItem('can2025_predictions', JSON.stringify(predictions));

        if (!user) {
            toast.info("Pronostics sauvegardés sur cet appareil ! Connectez-vous pour synchroniser en ligne.");
            return;
        }

        setIsSaving(true);
        try {
            const champion = getPredictedChampion();
            console.log("Saving Champion:", champion);

            if (!champion) {
                toast.warning("Attention : Aucun champion sélectionné ! Le classement affichera '-'.");
            } else {
                toast.info(`Sauvegarde du champion : ${champion.name}`);
            }

            const { error } = await supabase
                .from('predictions' as any)
                .upsert({
                    user_id: user.id,
                    bracket_data: predictions,
                    champion_id: champion?.id || null,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' } as any);

            if (error) {
                // Si la table n'existe pas encore, on ne bloque pas l'utilisateur
                if (error.message?.includes("schema cache") || error.code === '42P01') {
                    toast.success("Sauvegardé sur cet appareil !");
                    toast.info("La synchronisation en ligne sera active dès que la base de données sera prête.");
                    console.warn("Table 'predictions' non trouvée. Sauvegardé en local.");
                } else {
                    throw error;
                }
            } else {
                toast.success("Vos pronostics ont été synchronisés avec succès !");
            }
        } catch (error: any) {
            console.error('Error saving predictions:', error);
            toast.error("Erreur de synchronisation : " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <PredictionContext.Provider
            value={{
                predictions,
                setPrediction,
                setScore,
                getWinner,
                clearPredictions,
                calculatePathToFinal,
                getPredictedChampion,
                savePredictions,
                isSaving,
            }}
        >
            {children}
        </PredictionContext.Provider>
    );
}
