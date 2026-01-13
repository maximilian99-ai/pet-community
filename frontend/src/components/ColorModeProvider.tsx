'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useColorMode } from '@chakra-ui/react';

interface ColorModeProviderProps {
  children: ReactNode;
}

export function ColorModeProvider({ children }: ColorModeProviderProps) {
  const { colorMode, setColorMode } = useColorMode();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load color mode preference from localStorage
    const savedColorMode = localStorage.getItem('chakra-ui-color-mode');
    if (savedColorMode && savedColorMode !== colorMode) {
      setColorMode(savedColorMode);
    }
  }, [colorMode, setColorMode]);

  if (!isMounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
