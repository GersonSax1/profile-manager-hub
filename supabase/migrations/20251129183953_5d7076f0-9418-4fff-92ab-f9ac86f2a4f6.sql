-- Add blood_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN blood_type TEXT;

-- Update the handle_new_user function to include blood_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, phone, blood_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'blood_type'
  );
  RETURN NEW;
END;
$function$;