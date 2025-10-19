-- Add optional PDF upload column for Zustandsbericht
ALTER TABLE vehicles 
ADD COLUMN zustandsbericht_pdf_url text;