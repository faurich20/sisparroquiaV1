import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
  light: 'light',
  dark: 'dark',
  blue: 'blue',
  green: 'green',
  orange: 'orange',
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.light);

  useEffect(() => {
    document.documentElement.className = ''; // limpiar clases previas
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
//asd


