import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';


export default function Index() {


  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <HeroSection />



      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>CAN 2025 Morocco • Africa Cup of Nations</p>
        </div>
      </footer>
    </div>
  );
}
