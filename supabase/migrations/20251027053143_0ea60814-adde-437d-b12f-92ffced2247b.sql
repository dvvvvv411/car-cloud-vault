-- Lösche alle Leads der beiden Kampagnen vom 27.10.2025
DELETE FROM leads 
WHERE campaign_id IN (
  'd5e4450b-da68-4b86-82a4-7a94df089ecb',
  'b6bb4ba7-c92e-4330-8279-1d4d2be67566'
);

-- Lösche die beiden Kampagnen selbst
DELETE FROM lead_campaigns 
WHERE id IN (
  'd5e4450b-da68-4b86-82a4-7a94df089ecb',
  'b6bb4ba7-c92e-4330-8279-1d4d2be67566'
);