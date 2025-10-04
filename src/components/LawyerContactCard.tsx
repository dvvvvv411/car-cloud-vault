import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import lawyerAvatar from "@/assets/mark-steh.png";

const LawyerContactCard = () => {
  return (
    <div className="hidden xl:block fixed bottom-8 right-[max(1rem,calc(((100vw-1400px)/4)-190px))] w-[380px] glassmorphism backdrop-blur-2xl bg-white/90 rounded-2xl p-8 shadow-[0_8px_32px_-4px_rgba(0,112,243,0.08)] border border-primary/10 z-[60] hover:shadow-[0_12px_48px_-8px_rgba(0,112,243,0.12)] transition-all duration-300">
      
      {/* Avatar - klein & clean */}
      <div className="flex justify-center mb-6">
        <img 
          src={lawyerAvatar} 
          alt="Rechtsanwalt Mark Steh" 
          className="w-28 h-28 rounded-full object-cover ring-2 ring-primary/10 hover:ring-primary/20 transition-all duration-300 hover:scale-105"
        />
      </div>
      
      {/* Name - kompakt */}
      <div className="text-center mb-6">
        <p className="text-xs text-muted-foreground mb-1 font-light tracking-wide uppercase">Rechtsanwalt</p>
        <h3 className="text-xl font-normal text-foreground">Mark Steh</h3>
      </div>
      
      {/* Phone - highlight */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 mb-6 border border-primary/15">
        <a 
          href="tel:+492115426220"
          className="text-3xl font-semibold text-foreground hover:text-primary transition-colors block text-center"
        >
          0211 54262200
        </a>
      </div>
      
      {/* CTA - nur einer */}
      <a href="tel:+492115426220">
        <Button 
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 text-base font-medium shadow-lg shadow-primary/10"
        >
          <Phone className="w-4 h-4 mr-2" />
          Jetzt anrufen
        </Button>
      </a>
      
      {/* Email - dezent */}
      <div className="mt-4 text-center">
        <a 
          href="mailto:m.steh@kbs-kanzlei.de"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          m.steh@kbs-kanzlei.de
        </a>
      </div>
    </div>
  );
};

export default LawyerContactCard;
