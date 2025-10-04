import { Phone, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import lawyerAvatar from "@/assets/mark-steh.png";

const LawyerContactCard = () => {
  return (
    <div className="hidden xl:block fixed bottom-8 right-[max(1rem,calc(((100vw-1400px)/4)-266px))] w-[520px] glassmorphism backdrop-blur-xl bg-white/95 rounded-3xl p-10 shadow-2xl border border-white/20 z-[60] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-300">
      {/* Profile Image */}
      <div className="flex justify-center mb-8">
        <img 
          src={lawyerAvatar} 
          alt="Rechtsanwalt Mark Steh" 
          className="w-40 h-40 rounded-full object-cover shadow-2xl ring-4 ring-white/50 hover:ring-[#C5A572]/30 transition-all duration-300 hover:scale-105"
        />
      </div>
      
      {/* Professional Title & Name */}
      <div className="text-center mb-8">
        <p className="text-sm text-muted-foreground mb-2 font-light tracking-wide uppercase">Rechtsanwalt</p>
        <h3 className="text-4xl font-bold text-foreground mb-1">Mark Steh</h3>
      </div>
      
      {/* Law Firm Information */}
      <div className="text-center mb-8 space-y-1">
        <p className="font-semibold text-foreground text-lg">KBS Rechtsanwälte</p>
        <p className="text-muted-foreground text-sm font-light">Küpper Bredehöft Schwencker PartG</p>
        <p className="text-muted-foreground text-sm font-light mt-2">Speldorfer Str. 2 · 40239 Düsseldorf</p>
      </div>
      
      {/* Contact Information */}
      <div className="mb-8 flex justify-center">
        <a 
          href="mailto:m.steh@kbs-kanzlei.de"
          className="flex items-center gap-2 text-muted-foreground hover:text-[#C5A572] transition-colors group"
        >
          <Mail className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-light">m.steh@kbs-kanzlei.de</span>
        </a>
      </div>

      {/* Dominant Phone Number Display */}
      <div className="bg-gradient-to-br from-[#C5A572]/10 to-[#B4954F]/5 rounded-2xl p-8 mb-8 border border-[#C5A572]/20">
        <div className="flex flex-col items-center gap-4">
          <Phone className="w-8 h-8 text-[#C5A572]" />
          <a 
            href="tel:+492115426220"
            className="text-4xl font-bold text-foreground hover:text-[#C5A572] transition-colors"
          >
            0211 54262200
          </a>
        </div>
      </div>
      
      {/* CTA Buttons */}
      <div className="space-y-3">
        <a href="tel:+492115426220" className="block">
          <Button 
            className="w-full bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl h-12"
            size="lg"
          >
            <Phone className="w-5 h-5 mr-2" />
            Jetzt anrufen
          </Button>
        </a>
        
        <a href="https://kbs-kanzlei.de" target="_blank" rel="noopener noreferrer" className="block">
          <Button 
            className="w-full bg-[#C5A572] text-white hover:bg-[#B4954F] font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl h-12"
            size="lg"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Zur Anwaltskanzlei
          </Button>
        </a>
      </div>
    </div>
  );
};

export default LawyerContactCard;
