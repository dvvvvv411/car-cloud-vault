import { useEffect } from 'react';

const ExternalRedirect = () => {
  useEffect(() => {
    window.location.replace('https://kbs-kanzlei.de');
  }, []);

  return null;
};

export default ExternalRedirect;
