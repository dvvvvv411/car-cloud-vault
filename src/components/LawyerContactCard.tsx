import { useState } from "react";
import { Phone, Mail, Building2, MapPin, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { X } from "lucide-react";
import lawyerAvatar from "@/assets/mark-steh.png";

interface LawyerContactCardProps {
  hideMobileButton?: boolean;
  lawyerName?: string;
  lawyerPhotoUrl?: string;
  firmName?: string;
  firmSubtitle?: string;
  addressStreet?: string;
  addressCity?: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
}

const LawyerContactCard = ({ 
  hideMobileButton = false,
  lawyerName = "Mark Steh",
  lawyerPhotoUrl = lawyerAvatar,
  firmName = "KBS Rechtsanwälte",
  firmSubtitle = "Küpper Bredehöft Schwencker PartG",
  addressStreet = "Speldorfer Str. 2",
  addressCity = "40239 Düsseldorf",
  email = "m.steh@kbs-kanzlei.de",
  phone = "0211 54262200",
  websiteUrl = "https://kbs-kanzlei.de"
}: LawyerContactCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Format phone number for tel: link
  const phoneLink = `tel:${phone.replace(/\s/g, '')}`;

  // Contact Card Content Component (reusable for both desktop and mobile)
  const ContactContent = () => (
    <>
      {/* Profile Image & Name - Side by Side Layout */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <img 
          src={lawyerPhotoUrl} 
          alt={`Rechtsanwalt ${lawyerName}`}
          className="w-32 h-32 rounded-full object-cover shadow-lg"
        />
        <div>
          <p className="text-base text-white/80 mb-1">Rechtsanwalt</p>
          <h3 className="text-3xl font-bold">{lawyerName}</h3>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/20 mb-6" />
      
      {/* Law Firm Information */}
      <div className="space-y-2 mb-6 text-base">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-white/70" />
          <div className="leading-relaxed">
            <p className="font-medium">{firmName}</p>
            {firmSubtitle && <p className="text-white/80">{firmSubtitle}</p>}
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-white/70" />
          <div className="leading-relaxed text-white/80">
            <p>{addressStreet}</p>
            <p>{addressCity}</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/20 mb-6" />
      
      {/* Contact Information */}
      <div className="mb-6">
        <a 
          href={`mailto:${email}`}
          className="flex items-center gap-3 text-base hover:text-white/80 transition-colors group mb-4"
        >
          <Mail className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className="break-all">{email}</span>
        </a>
      </div>

      {/* Dominant Phone Number Display */}
      <div className="bg-white/10 rounded-xl p-6 mb-6 border border-white/20">
        <div className="flex flex-col items-center gap-3">
          <Phone className="w-8 h-8 text-white/90" />
          <a 
            href={phoneLink}
            className="text-4xl font-bold hover:text-white/80 transition-colors"
          >
            {phone}
          </a>
        </div>
      </div>
      
      {/* CTA Buttons */}
      <div className="space-y-3">
        <a href={phoneLink} className="block">
          <Button 
            className="w-full bg-white text-[#003e7e] hover:bg-white/90 font-semibold shadow-lg hover:shadow-xl transition-all min-h-12"
            size="lg"
          >
            <Phone className="w-5 h-5 mr-2" />
            Jetzt anrufen
          </Button>
        </a>
        
        <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="block">
          <Button 
            className="w-full bg-[#C5A572] text-white hover:bg-[#B4954F] font-semibold shadow-lg hover:shadow-xl transition-all min-h-12"
            size="lg"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Zur Anwaltskanzlei
          </Button>
        </a>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile/Tablet: Floating Contact Button + Drawer */}
      {!hideMobileButton && (
        <div className="block xl:hidden">
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <button
                className="fixed bottom-4 right-4 z-[70] bg-[#003e7e] text-white rounded-full p-4 shadow-2xl hover:bg-[#002d5c] transition-all hover:scale-110"
                aria-label="Kontakt öffnen"
              >
                <Phone className="w-6 h-6" />
              </button>
            </DrawerTrigger>
          <DrawerContent className="bg-[#003e7e] text-white border-t-4 border-white/20 max-h-[90vh]">
            <DrawerHeader className="relative">
              <DrawerTitle className="text-2xl font-bold text-center">Rechtsanwalt kontaktieren</DrawerTitle>
              <DrawerClose asChild>
                <button
                  className="absolute top-2 right-2 p-2 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Schließen"
                >
                  <X className="w-6 h-6" />
                </button>
              </DrawerClose>
            </DrawerHeader>
            <div className="px-6 pb-8 overflow-y-auto">
              <ContactContent />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      )}

      {/* Desktop: Runder Button wenn collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="hidden xl:flex fixed bottom-4 right-4 z-[70] bg-[#003e7e] text-white rounded-full p-4 shadow-2xl hover:bg-[#002d5c] transition-all hover:scale-110 items-center justify-center"
          aria-label="Kontakt öffnen"
        >
          <Phone className="w-6 h-6" />
        </button>
      )}

      {/* Desktop: Volle Card wenn nicht collapsed */}
      {!isCollapsed && (
        <div className="hidden xl:block fixed bottom-0 right-[max(1rem,calc(((100vw-1400px)/4)-266px))] w-[500px] bg-[#003e7e] text-white rounded-t-full shadow-2xl z-[60] pt-20 pb-8 px-10">
          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(true)}
            className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center justify-center transition-all z-10 hover:scale-110"
            aria-label="Card minimieren"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          {/* Content */}
          <ContactContent />
        </div>
      )}
    </>
  );
};

export default LawyerContactCard;
