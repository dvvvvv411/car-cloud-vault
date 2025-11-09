import { useQuery } from '@tanstack/react-query';
import { useBrandings } from './useBranding';

export const useDomainBranding = () => {
  const { data: brandings, isLoading: brandingsLoading } = useBrandings();

  const { data: branding, isLoading: matchingLoading } = useQuery({
    queryKey: ['domain-branding', brandings],
    queryFn: async () => {
      if (!brandings || brandings.length === 0) return null;

      // 1. Get current domain
      const hostname = window.location.hostname;
      
      // 2. Extract main domain (remove subdomain)
      const parts = hostname.split('.');
      const mainDomain = parts.length > 2 
        ? parts.slice(-2).join('.') 
        : hostname;

      console.log('[useDomainBranding] Current hostname:', hostname);
      console.log('[useDomainBranding] Main domain:', mainDomain);

      // 3. Find matching branding based on lawyer_website_url
      const matchedBranding = brandings.find(branding => {
        try {
          const brandingUrl = new URL(branding.lawyer_website_url);
          const brandingDomain = brandingUrl.hostname.replace('www.', '');
          console.log('[useDomainBranding] Comparing with:', brandingDomain, 'for:', branding.slug);
          return brandingDomain === mainDomain;
        } catch (e) {
          console.error('[useDomainBranding] Invalid URL:', branding.lawyer_website_url);
          return false;
        }
      });

      // 4. Fallback to first active branding if no match (useful for localhost)
      const targetBranding = matchedBranding || brandings[0];
      
      console.log('[useDomainBranding] Selected branding:', targetBranding?.slug);
      
      return targetBranding;
    },
    enabled: !!brandings && brandings.length > 0,
  });

  return {
    branding,
    isLoading: brandingsLoading || matchingLoading,
  };
};
