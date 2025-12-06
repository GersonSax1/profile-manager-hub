-- Add medications column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN medications text;