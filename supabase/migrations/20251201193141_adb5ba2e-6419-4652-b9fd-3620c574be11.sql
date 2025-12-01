-- Add profile_type and rut columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN profile_type text NOT NULL DEFAULT 'human',
ADD COLUMN rut text;

-- Add constraint to validate RUT format (Chilean ID)
ALTER TABLE public.profiles
ADD CONSTRAINT rut_format_check CHECK (
  rut IS NULL OR rut ~ '^[0-9]{7,8}-[0-9Kk]$'
);

-- Add constraint to ensure RUT is only for humans
ALTER TABLE public.profiles
ADD CONSTRAINT rut_only_for_humans CHECK (
  profile_type = 'human' OR rut IS NULL
);