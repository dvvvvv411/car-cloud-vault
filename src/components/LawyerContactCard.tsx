import { Phone, Mail, Building2, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import lawyerAvatar from "@/assets/mark-steh.png";

const LawyerContactCard = () => {
  return (
    <div className="hidden xl:block fixed bottom-0 right-[max(1rem,calc(((100vw-1400px)/4)-266px))] w-[500px] glassmorphism backdrop-blur-2xl bg-white/95 rounded-3xl pt-10 pb-8 px-10 shadow-[0_8px_32px_-4px_rgba(0,112,243,0.12)] border border-primary/10 z-[60] hover:shadow-[0_12px_48px_-8px_rgba(0,112,243,0.18)] transition-all duration-300">
      {/* Profile Image */}
      <div className="flex justify-center mb-5">
        <img 
          src={lawyerAvatar} 
          alt="Rechtsanwalt Mark Steh" 
          className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/10 shadow-xl hover:ring-primary/20 hover:scale-105 transition-all duration-300"
        />
      </div>
      
      {/* Professional Title & Name */}
      <div className="text-center mb-6">
        <p className="text-base text-muted-foreground mb-1">Rechtsanwalt</p>
        <h3 className="text-3xl font-bold text-foreground">Mark Steh</h3>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />
      
      {/* Law Firm Information */}
      <div className="space-y-2 mb-6 text-base">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary/60" />
          <div className="leading-relaxed">
            <p className="font-medium text-foreground">KBS Rechtsanwälte</p>
            <p className="text-muted-foreground">Küpper Bredehöft Schwencker PartG</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary/60" />
          <div className="leading-relaxed text-muted-foreground">
            <p>Speldorfer Str. 2</p>
            <p>40239 Düsseldorf</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />
      
      {/* Contact Information */}
      <div className="mb-6">
        <a 
          href="mailto:m.steh@kbs-kanzlei.de"
          className="flex items-center gap-3 text-base text-foreground hover:text-primary transition-colors group mb-4"
        >
          <Mail className="w-5 h-5 flex-shrink-0 text-primary/60 group-hover:scale-110 group-hover:text-primary transition-all" />
          <span className="break-all">m.steh@kbs-kanzlei.de</span>
        </a>
      </div>

      {/* Dominant Phone Number Display */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 mb-6 border border-primary/15">
        <div className="flex flex-col items-center gap-3">
          <Phone className="w-8 h-8 text-primary" />
          <a 
            href="tel:+492115426220"
            className="text-4xl font-bold text-foreground hover:text-primary transition-colors"
          >
            0211 54262200
          </a>
        </div>
      </div>
      
      {/* CTA Buttons */}
      <div className="space-y-3">
        <a href="tel:+492115426220" className="block">
          <Button 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/10 hover:shadow-xl transition-all rounded-xl"
            size="lg"
          >
            <Phone className="w-5 h-5 mr-2" />
            Jetzt anrufen
          </Button>
        </a>
        
        <a href="https://kbs-kanzlei.de" target="_blank" rel="noopener noreferrer" className="block">
          <Button 
            className="w-full bg-primary/90 text-white hover:bg-primary font-semibold shadow-lg shadow-primary/10 hover:shadow-xl transition-all rounded-xl"
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
