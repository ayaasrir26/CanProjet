import { Header } from "@/components/Header";

export default function Admin() {
    return (
        <div className="min-h-screen bg-transparent">
            <Header />
            <main className="container mx-auto px-4 py-32 text-center">
                <h1 className="font-royal text-6xl text-royal-emerald mb-8 uppercase tracking-tighter">
                    Console de <span className="text-star-red">Gestion</span>
                </h1>
                <div className="glass-zellige p-12 rounded-[3rem] border-white/40 shadow-2xl max-w-2xl mx-auto">
                    <p className="text-royal-emerald/60 font-medium text-xl leading-relaxed">
                        Bienvenue dans le centre de commandement. Cette section est réservée aux administrateurs pour la gestion des matchs et des scores.
                    </p>
                </div>
            </main>
        </div>
    );
}
