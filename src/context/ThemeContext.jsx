import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // 테마 초기값 설정 (localStorage에 저장된 값이 없으면 무조건 'dark' 모드가 기본)
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('gaja_theme');
        if (savedTheme) {
            return savedTheme;
        }
        return 'dark';
    });

    useEffect(() => {
        // html 태그에 data-theme 속성 주입
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('gaja_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
