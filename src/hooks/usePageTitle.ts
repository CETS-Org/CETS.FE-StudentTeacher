import { useEffect } from 'react';

/**
 * Custom hook to manage page titles dynamically
 * @param title - The title to set for the page
 * @param baseTitle - Optional base title to append (defaults to "CETS Admin")
 */
export function usePageTitle(title: string, baseTitle: string = "CETS Student & Teacher") {
  useEffect(() => {
    const fullTitle = title ? `${title} - ${baseTitle}` : baseTitle;
    document.title = fullTitle;
    
    return () => {
      document.title = baseTitle;
    };
  }, [title, baseTitle]);
}
