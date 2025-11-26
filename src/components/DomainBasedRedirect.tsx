import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useBrandings } from '@/hooks/useBranding';
import { Loader2 } from 'lucide-react';

interface DomainBasedRedirectProps {
  targetPath: 'root' | 'insolvenz' | 'fahrzeuge';
}

const DomainBasedRedirect = ({ targetPath }: DomainBasedRedirectProps) => {
  const { data: brandings, isLoading } = useBrandings();
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  const [isExternalRedirect, setIsExternalRedirect] = useState(false);

  useEffect(() => {
    if (!brandings || brandings.length === 0) return;

    // 1. Filter brandings by type based on targetPath
    const filteredBrandings = brandings.filter(b => {
      if (targetPath === 'fahrzeuge') return b.branding_type === 'fahrzeuge';
      if (targetPath === 'insolvenz') return b.branding_type === 'insolvenz';
      return true; // root: all brandings
    });

    if (filteredBrandings.length === 0) {
      console.log('[DomainBasedRedirect] No brandings found for type:', targetPath);
      return;
    }

    // 2. Get current domain
    const hostname = window.location.hostname;
    
    // 3. Extract main domain (remove subdomain)
    const parts = hostname.split('.');
    const mainDomain = parts.length > 2 
      ? parts.slice(-2).join('.') 
      : hostname;

    console.log('[DomainBasedRedirect] Current hostname:', hostname);
    console.log('[DomainBasedRedirect] Main domain:', mainDomain);

    // 4. Find matching branding based on lawyer_website_url
    const matchedBranding = filteredBrandings.find(branding => {
      try {
        const brandingUrl = new URL(branding.lawyer_website_url);
        const brandingDomain = brandingUrl.hostname.replace('www.', '');
        console.log('[DomainBasedRedirect] Comparing with branding domain:', brandingDomain, 'for slug:', branding.slug);
        return brandingDomain === mainDomain;
      } catch (e) {
        console.error('[DomainBasedRedirect] Invalid URL in branding:', branding.lawyer_website_url);
        return false;
      }
    });

    // 5. Fallback to first filtered branding if no match (useful for localhost)
    const targetBranding = matchedBranding || filteredBrandings[0];
    
    console.log('[DomainBasedRedirect] Matched branding:', targetBranding.slug);

    // 6. Set redirect target based on targetPath
    if (targetPath === 'root') {
      // Root path: Redirect to external lawyer website
      console.log('[DomainBasedRedirect] Redirecting to lawyer website:', targetBranding.lawyer_website_url);
      setRedirectTarget(targetBranding.lawyer_website_url);
      setIsExternalRedirect(true);
    } else if (targetPath === 'fahrzeuge') {
      // /fahrzeuge path: Redirect to internal fahrzeuge branding page
      const internalPath = `/fahrzeuge/${targetBranding.slug}`;
      console.log('[DomainBasedRedirect] Redirecting to fahrzeuge page:', internalPath);
      setRedirectTarget(internalPath);
      setIsExternalRedirect(false);
    } else {
      // /insolvenz path: Redirect to internal branding page
      const internalPath = `/insolvenz/${targetBranding.slug}`;
      console.log('[DomainBasedRedirect] Redirecting to internal page:', internalPath);
      setRedirectTarget(internalPath);
      setIsExternalRedirect(false);
    }
  }, [brandings, targetPath]);

  // Loading state
  if (isLoading || !redirectTarget) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // External redirect (for root path)
  if (isExternalRedirect) {
    window.location.href = redirectTarget;
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Internal redirect (for /insolvenz path)
  return <Navigate to={redirectTarget} replace />;
};

export default DomainBasedRedirect;
