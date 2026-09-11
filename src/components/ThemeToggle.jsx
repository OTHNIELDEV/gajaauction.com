import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <button
            type="button"
            className={`theme-toggle-btn ${className}`}
            onClick={toggleTheme}
            aria-label={`현재 ${isDark ? '다크' : '라이트'} 모드입니다. ${isDark ? '라이트' : '다크'} 모드로 전환`}
            title={`${isDark ? '라이트' : '다크'} 모드로 전환`}
        >
            <span className="toggle-icon-bg toggle-icon-sun">
                <i className="fas fa-sun"></i>
            </span>
            <span className="toggle-icon-bg toggle-icon-moon">
                <i className="fas fa-moon"></i>
            </span>
            <div className="toggle-thumb">
                <span className="thumb-inner-icon">
                    <i className={`fas ${isDark ? 'fa-moon' : 'fa-sun'}`}></i>
                </span>
            </div>
        </button>
    );
};

export default ThemeToggle;
