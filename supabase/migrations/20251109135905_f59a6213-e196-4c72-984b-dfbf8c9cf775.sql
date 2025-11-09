-- Lösche Fahrzeuge mit den angegebenen DEKRA-Nummern (report_nr)
DELETE FROM vehicles 
WHERE report_nr IN (
  '4539',
  '2725',
  '2348',
  '4584',
  '1962',
  '1884',
  '2774',
  '3072',
  '4979',
  '4089'
);