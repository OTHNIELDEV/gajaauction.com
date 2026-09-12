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

        // 멀티 윈도우/탭(원창 ↔ 팝업창/별도창) 실시간 브로드캐스팅
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                const channel = new BroadcastChannel('gaja_theme_channel');
                channel.postMessage(theme);
                channel.close();
            } catch (e) {
                // fallback to storage event
            }
        }
    }, [theme]);

    useEffect(() => {
        // 1. BroadcastChannel 수신 리스너
        let channel = null;
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                channel = new BroadcastChannel('gaja_theme_channel');
                channel.onmessage = (event) => {
                    if (event.data && (event.data === 'dark' || event.data === 'light')) {
                        setTheme(prev => (prev !== event.data ? event.data : prev));
                    }
                };
            } catch (e) {
                // Ignore channel errors
            }
        }

        // 2. Storage 이벤트 수신 리스너 (동일 도메인 다른 창 감지)
        const handleStorageChange = (e) => {
            if (e.key === 'gaja_theme' && e.newValue) {
                if (e.newValue === 'dark' || e.newValue === 'light') {
                    setTheme(prev => (prev !== e.newValue ? e.newValue : prev));
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            if (channel) {
                try { channel.close(); } catch (e) {}
            }
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

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
