import { Phone, Mail, Building2, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import lawyerAvatar from "@/assets/mark-steh.png";

const LawyerContactCard = () => {
  return (
    <div className="hidden xl:block fixed bottom-0 right-[max(1rem,calc(((100vw-1400px)/4)-266px))] w-[500px] bg-[#003e7e] text-white rounded-t-full pt-20 pb-8 px-10 shadow-2xl z-[60]">
      {/* Profile Image & Name - Side by Side Layout */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <img 
          src={lawyerAvatar} 
          alt="Rechtsanwalt Mark Steh" 
          className="w-32 h-32 rounded-full object-cover shadow-lg"
        />
        <div>
          <p className="text-base text-white/80 mb-1">Rechtsanwalt</p>
          <h3 className="text-3xl font-bold">Mark Steh</h3>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/20 mb-6" />
      
      {/* Law Firm Information */}
      <div className="space-y-2 mb-6 text-base">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-white/70" />
          <div className="leading-relaxed">
            <p className="font-medium">KBS Rechtsanwälte</p>
            <p className="text-white/80">Küpper Bredehöft Schwencker PartG</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-white/70" />
          <div className="leading-relaxed text-white/80">
            <p>Speldorfer Str. 2</p>
            <p>40239 Düsseldorf</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/20 mb-6" />
      
      {/* Contact Information */}
      <div className="mb-6">
        <a 
          href="mailto:m.steh@kbs-kanzlei.de"
          className="flex items-center gap-3 text-base hover:text-white/80 transition-colors group mb-4"
        >
          <Mail className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="break-all">m.steh@kbs-kanzlei.de</span>
        </a>
      </div>

      {/* Dominant Phone Number Display */}
      <div className="bg-white/10 rounded-xl p-6 mb-6 border border-white/20">
        <div className="flex flex-col items-center gap-3">
          <Phone className="w-8 h-8 text-white/90" />
          <a 
            href="tel:+492115426220"
            className="text-4xl font-bold hover:text-white/80 transition-colors"
          >
            0211 54262200
          </a>
        </div>
      </div>
      
      {/* CTA Buttons */}
      <div className="space-y-3">
        <a href="tel:+492115426220" className="block">
          <Button 
            className="w-full bg-white text-[#003e7e] hover:bg-white/90 font-semibold shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <Phone className="w-5 h-5 mr-2" />
            Jetzt anrufen
          </Button>
        </a>
        
        <a href="https://kbs-kanzlei.de" target="_blank" rel="noopener noreferrer" className="block">
          <Button 
            className="w-full bg-[#C5A572] text-white hover:bg-[#B4954F] font-semibold shadow-lg hover:shadow-xl transition-all"
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
