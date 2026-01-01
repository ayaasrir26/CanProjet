import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = authSchema.safeParse({ email, password, fullName: isSignUp ? fullName : undefined });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      const { error } = isSignUp
        ? await signUp(email, password, fullName)
        : await signIn(email, password);

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success(isSignUp ? 'Account created successfully!' : 'Welcome back!');
        navigate('/');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-royal overflow-hidden relative flex items-center justify-center p-6">
      {/* Immersive Background Ornaments */}
      <div className="absolute inset-0 zellige-grid opacity-20 animate-float pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 moorish-arch bg-saffron/10 -rotate-45" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 star-8-clip bg-star-red/10 rotate-45" />

      <div className="w-full max-w-xl relative z-10">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 text-white/70 hover:text-saffron mb-10 transition-all font-royal uppercase tracking-widest text-sm"
        >
          <div className="p-2 bg-white/10 rounded-xl group-hover:bg-saffron/20 group-hover:-translate-x-1 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Retour au Royaume
        </button>

        <div className="glass-zellige rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group/form">
          {/* Form Arch Header */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-saffron opacity-60" />

          <div className="text-center mb-12">
            <div className="relative inline-block p-4 bg-white/50 rounded-[2rem] border border-white/40 shadow-xl mb-6 group-hover/form:scale-110 transition-transform duration-700">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-20 h-20 object-contain"
              />
            </div>
            <h1 className="font-royal text-5xl text-royal-emerald mb-2 uppercase tracking-tighter text-center">
              {isSignUp ? 'REJOINDRE' : 'ACCÉDER'} <span className="text-star-red">L'ÉLITE</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="h-0.5 w-4 bg-saffron/50 rounded-full" />
              <p className="text-royal-emerald/50 font-black uppercase tracking-[0.2em] text-[10px]">
                {isSignUp ? 'Inscrivez-vous pour marquer l\'histoire' : 'Votre place est réservée'}
              </p>
              <span className="h-0.5 w-4 bg-saffron/50 rounded-full" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-royal text-royal-emerald/70 uppercase tracking-widest text-xs ml-2">Nom de Légende</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VOTRE NOM"
                  className="h-14 bg-white/50 border-royal-emerald/10 rounded-2xl font-royal text-royal-emerald focus:ring-royal-emerald/20 transition-all placeholder:text-royal-emerald/20"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-royal text-royal-emerald/70 uppercase tracking-widest text-xs ml-2">Email Impérial</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VOTRE EMAIL"
                className="h-14 bg-white/50 border-royal-emerald/10 rounded-2xl font-royal text-royal-emerald focus:ring-royal-emerald/20 transition-all placeholder:text-royal-emerald/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-royal text-royal-emerald/70 uppercase tracking-widest text-xs ml-2">Sceau Secret</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-14 bg-white/50 border-royal-emerald/10 rounded-2xl font-royal text-royal-emerald focus:ring-royal-emerald/20 transition-all placeholder:text-royal-emerald/20"
              />
            </div>

            <Button type="submit" className="btn-royal w-full h-16 text-lg mt-4 shadow-royal-emerald/30 group" disabled={loading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : (isSignUp ? 'CRÉER MON DESTIN' : 'ENTRER DANS LE RIAD')}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-royal-emerald/5 text-center">
            <p className="text-sm font-black text-royal-emerald/50 uppercase tracking-widest">
              {isSignUp ? 'Déjà membre de la cour ?' : "Pas encore de titre ?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-star-red hover:text-royal-emerald transition-colors ml-2"
              >
                {isSignUp ? 'SE CONNECTER' : 'S\'INSCRIRE'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
