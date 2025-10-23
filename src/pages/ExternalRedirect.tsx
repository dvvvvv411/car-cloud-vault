import { useEffect } from 'react';

const ExternalRedirect = () => {
  useEffect(() => {
    window.location.replace('https://solle-schniebel.de');
  }, []);

  return null;
};

export default ExternalRedirect;
