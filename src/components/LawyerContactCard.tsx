import { Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import lawyerAvatar from "@/assets/lawyer-avatar-placeholder.png";

const LawyerContactCard = () => {
  return (
    <div className="hidden xl:block fixed bottom-0 right-8 w-80 bg-[#003e7e] text-white rounded-t-full pt-8 pb-6 px-6 shadow-2xl z-40">
      {/* Profile Image */}
      <div className="flex justify-center mb-4">
        <img 
          src={lawyerAvatar} 
          alt="Mark Steh" 
          className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
        />
      </div>
      
      {/* Name */}
      <h3 className="text-xl font-semibold text-center mb-4">Mark Steh</h3>
      
      {/* Contact Information */}
      <div className="space-y-3 mb-5">
        <a 
          href="mailto:m.steh@kbs-kanzlei.de"
          className="flex items-center gap-3 text-sm hover:text-white/80 transition-colors"
        >
          <Mail className="w-4 h-4 flex-shrink-0" />
          <span className="break-all">m.steh@kbs-kanzlei.de</span>
        </a>
        
        <a 
          href="tel:+492115426220"
          className="flex items-center gap-3 text-sm hover:text-white/80 transition-colors"
        >
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>0211 54262200</span>
        </a>
      </div>
      
      {/* CTA Button */}
      <a href="tel:+492115426220" className="block">
        <Button 
          className="w-full bg-white text-[#003e7e] hover:bg-white/90 font-semibold"
          size="lg"
        >
          <Phone className="w-4 h-4 mr-2" />
          Jetzt anrufen
        </Button>
      </a>
    </div>
  );
};

export default LawyerContactCard;
