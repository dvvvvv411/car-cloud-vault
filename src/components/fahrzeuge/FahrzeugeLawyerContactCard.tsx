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
import lawyerAvatar from "@/assets/lawyer-avatar-placeholder.png";

interface LawyerContactCardProps {
  inlineHeaderMode?: boolean;
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
  inlineHeaderMode = false,
  hideMobileButton = false,
  lawyerName = "Max Müller",
  lawyerPhotoUrl = lawyerAvatar,
  firmName = "Auto Müller GmbH",
  firmSubtitle = "Verkaufsleiter",
  addressStreet = "Musterstraße 123",
  addressCity = "12345 Berlin",
  email = "verkauf@automueller.de",
  phone = "030 12345678",
  websiteUrl = "https://automueller.de"
}: LawyerContactCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Format phone number for tel: link
  const phoneLink = `tel:${phone.replace(/\s/g, '')}`;

  // Inline Header Content for Desktop 50/50 Layout
  const InlineHeaderContent = () => (
    <div className="bg-[#003e7e] text-white rounded-2xl h-full p-4 lg:p-5 flex items-center">
      <div className="grid grid-cols-3 gap-x-4 lg:gap-x-6 w-full items-center">
        
        {/* SPALTE 1: Foto + Name */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <img 
            src={lawyerPhotoUrl} 
            alt={lawyerName}
            className="w-16 lg:w-20 h-16 lg:h-20 rounded-full object-cover shadow-lg border-2 border-white/20"
          />
          <div className="text-center">
            <p className="text-[10px] lg:text-xs text-white/70 mb-0.5">Ihr Ansprechpartner</p>
            <h3 className="text-sm lg:text-base font-bold leading-tight">{lawyerName}</h3>
          </div>
        </div>

        {/* SPALTE 2: Firma + Adresse */}
        <div className="flex flex-col justify-center space-y-2 lg:space-y-3">
          <div className="flex items-start gap-2">
            <Building2 className="w-3.5 lg:w-4 h-3.5 lg:h-4 flex-shrink-0 mt-0.5 text-white/70" />
            <div className="text-[11px] lg:text-xs">
              <p className="font-medium leading-tight">{firmName}</p>
              {firmSubtitle && <p className="text-white/80 leading-tight">{firmSubtitle}</p>}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 lg:w-4 h-3.5 lg:h-4 flex-shrink-0 mt-0.5 text-white/70" />
            <div className="text-[11px] lg:text-xs text-white/80 leading-tight">
              <p>{addressStreet}</p>
              <p>{addressCity}</p>
            </div>
          </div>
        </div>

        {/* SPALTE 3: Email + Telefon */}
        <div className="flex flex-col justify-center space-y-2 lg:space-y-3">
          <a 
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-[11px] lg:text-xs hover:text-white/80 transition-colors group"
          >
            <Mail className="w-3.5 lg:w-4 h-3.5 lg:h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className="break-all leading-tight">{email}</span>
          </a>

          <div className="bg-white/10 rounded-lg p-2 border border-white/20">
            <a 
              href={phoneLink}
              className="flex items-center justify-center gap-1.5 text-sm lg:text-base font-bold hover:text-white/80 transition-colors"
            >
              <Phone className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
              <span className="leading-tight">{phone}</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );

  // Contact Card Content Component (reusable for drawer and fixed card)
  const ContactContent = () => (
    <>
      {/* Profile Image & Name - Side by Side Layout */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <img 
          src={lawyerPhotoUrl} 
          alt={`${lawyerName}`}
          className="w-32 h-32 rounded-full object-cover shadow-lg"
        />
        <div>
          <p className="text-base text-white/80 mb-1">Ihr Ansprechpartner</p>
          <h3 className="text-3xl font-bold">{lawyerName}</h3>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/20 mb-6" />
      
      {/* Firm Information */}
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
            Zur Website
          </Button>
        </a>
      </div>
    </>
  );

  return (
    <>
      {/* Inline Header Mode für Desktop XL+ */}
      {inlineHeaderMode ? (
        <InlineHeaderContent />
      ) : (
        <>
          {/* Mobile/Tablet: Floating Contact Button + Drawer */}
          {!hideMobileButton && (
        <div className="block xl:hidden">
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <button
                className="fixed top-4 right-4 z-[70] bg-[#003e7e] text-white rounded-full p-4 shadow-2xl hover:bg-[#002d5c] transition-all hover:scale-110"
                aria-label="Kontakt öffnen"
              >
                <Phone className="w-6 h-6" />
              </button>
            </DrawerTrigger>
          <DrawerContent className="bg-[#003e7e] text-white border-t-4 border-white/20 max-h-[90vh]">
            <DrawerHeader className="relative">
              <DrawerTitle className="text-2xl font-bold text-center">Verkäufer kontaktieren</DrawerTitle>
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

          {/* Desktop: Fixed Card at Bottom Right */}
          <div className={`hidden xl:block fixed bottom-0 right-[max(1rem,calc(((100vw-1400px)/4)-266px))] w-[500px] bg-[#003e7e] text-white rounded-t-full shadow-2xl z-[60] transition-all duration-300 ${isCollapsed ? 'h-12 pt-2 pb-2 px-10' : 'pt-20 pb-8 px-10'}`}>
      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center justify-center transition-all z-10 hover:scale-110"
        aria-label={isCollapsed ? "Card erweitern" : "Card minimieren"}
      >
        {isCollapsed ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
      </button>

            {/* Content - only visible when not collapsed */}
            <div className={`transition-opacity duration-300 ${isCollapsed ? 'opacity-0 invisible h-0 overflow-hidden' : 'opacity-100 visible'}`}>
              <ContactContent />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default LawyerContactCard;
