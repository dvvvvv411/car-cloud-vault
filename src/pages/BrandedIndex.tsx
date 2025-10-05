import { useParams, Navigate } from 'react-router-dom';
import { useBranding } from '@/hooks/useBranding';
import { Loader2 } from 'lucide-react';
import Index from './Index';

const BrandedIndex = () => {
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
    return <Navigate to="/insolvenz" replace />;
  }

  return <Index branding={branding} />;
};

export default BrandedIndex;
