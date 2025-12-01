import { useAutoTranslate } from '@/hooks/useAutoTranslate';

interface TranslatedTextProps {
  children: string;
  className?: string;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({ children, className }) => {
  const translatedText = useAutoTranslate(children);
  
  return <span className={className}>{translatedText}</span>;
};
