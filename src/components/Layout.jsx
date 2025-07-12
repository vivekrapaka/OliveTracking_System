
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col">
      <Navigation />
      <main className="container mx-auto px-4 py-8 flex-1 professional-animate-in">
        <div className="professional-glass rounded-2xl p-1 shadow-professional-xl">
          <div className="bg-background/95 backdrop-blur-sm rounded-xl p-6">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
