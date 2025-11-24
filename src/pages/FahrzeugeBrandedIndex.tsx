import { useParams, Navigate } from 'react-router-dom';
import { useBranding } from '@/hooks/useBranding';
import { Loader2 } from 'lucide-react';
import FahrzeugeIndex from './FahrzeugeIndex';

const FahrzeugeBrandedIndex = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: branding, isLoading, error } = useBranding(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !branding) {
    return <Navigate to="/fahrzeuge" replace />;
  }

  // Check if branding type is 'fahrzeuge'
  if (branding.branding_type !== 'fahrzeuge') {
    return <Navigate to="/fahrzeuge" replace />;
  }

  return <FahrzeugeIndex branding={branding} />;
};

export default FahrzeugeBrandedIndex;
