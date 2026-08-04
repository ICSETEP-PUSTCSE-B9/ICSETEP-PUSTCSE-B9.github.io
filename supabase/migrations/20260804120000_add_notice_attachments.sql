/*
  # Add Attachment Columns to Notices Table

  1. Changes
    - `attachment_url` (text, nullable): Link or Data URL to attached file (PDF, Word, Excel, Image)
    - `attachment_name` (text, nullable): Display name of attached file
    - `attachment_type` (text, nullable): Attachment type ('pdf', 'word', 'excel', 'image', 'other')
*/

ALTER TABLE notices ADD COLUMN IF NOT EXISTS attachment_url text;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS attachment_name text;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS attachment_type text;
