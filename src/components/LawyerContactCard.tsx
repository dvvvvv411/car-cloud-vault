import { Phone, Mail, Building2, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import lawyerAvatar from "@/assets/lawyer-avatar-placeholder.png";

const LawyerContactCard = () => {
  return (
    <div className="hidden xl:block fixed bottom-0 right-8 w-[420px] bg-[#003e7e] text-white rounded-t-3xl pt-10 pb-8 px-8 shadow-2xl z-[60]">
      {/* Profile Image */}
      <div className="flex justify-center mb-5">
        <img 
          src={lawyerAvatar} 
          alt="Rechtsanwalt Mark Steh" 
          className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-lg"
        />
      </div>
      
      {/* Professional Title & Name */}
      <div className="text-center mb-6">
        <p className="text-sm text-white/80 mb-1">Rechtsanwalt</p>
        <h3 className="text-2xl font-bold">Mark Steh</h3>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/20 mb-6" />
      
      {/* Law Firm Information */}
      <div className="space-y-2 mb-6 text-sm">
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
      <div className="space-y-3 mb-6">
        <a 
          href="mailto:m.steh@kbs-kanzlei.de"
          className="flex items-center gap-3 text-sm hover:text-white/80 transition-colors group"
        >
          <Mail className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="break-all">m.steh@kbs-kanzlei.de</span>
        </a>
        
        <a 
          href="tel:+492115426220"
          className="flex items-center gap-3 text-sm hover:text-white/80 transition-colors group"
        >
          <Phone className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span>0211 54262200</span>
        </a>
      </div>

      {/* Availability Note */}
      <div className="bg-white/10 rounded-lg p-4 mb-6 border border-white/20">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-white/70" />
          <p className="text-xs leading-relaxed text-white/90">
            Derzeit hohe Nachfrage – sollten Sie uns nicht sofort erreichen, rufen wir Sie schnellstmöglich zurück.
          </p>
        </div>
      </div>
      
      {/* CTA Button */}
      <a href="tel:+492115426220" className="block">
        <Button 
          className="w-full bg-white text-[#003e7e] hover:bg-white/90 font-semibold shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          <Phone className="w-5 h-5 mr-2" />
          Jetzt anrufen
        </Button>
      </a>
    </div>
  );
};

export default LawyerContactCard;
