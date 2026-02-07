import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface YieldCalculatorProps {
    appraisalPrice: number;
    minPrice: number;
}

interface CalculatorInputs {
    bidPrice: number;
    loanRate: number;
    interestRate: number;
    salePrice: number;
}

interface CalculatorResults {
    totalInvestment: number; // 실투자금
    loanAmount: number;
    acquisitionTax: number;
    annualInterest: number;
    capitalGains: number;
    netProfit: number;
    roe: number;
    winningProbability: number;
}

export const YieldCalculator: React.FC<YieldCalculatorProps> = ({ appraisalPrice, minPrice }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Default values
    const [inputs, setInputs] = useState<CalculatorInputs>({
        bidPrice: minPrice,
        loanRate: 80,
        interestRate: 5.5,
        salePrice: Math.floor(minPrice * 1.3),
    });

    const [results, setResults] = useState<CalculatorResults>({
        totalInvestment: 0,
        loanAmount: 0,
        acquisitionTax: 0,
        annualInterest: 0,
        capitalGains: 0,
        netProfit: 0,
        roe: 0,
        winningProbability: 0
    });

    useEffect(() => {
        calculate();
    }, [inputs]);

    const calculate = () => {
        const { bidPrice, loanRate, interestRate, salePrice } = inputs;

        // 1. Costs
        const loanAmount = bidPrice * (loanRate / 100);
        const equity = bidPrice - loanAmount;
        const acquisitionTax = bidPrice * 0.046; // 4.6%
        const legalFees = bidPrice * 0.005; // 0.5%
        const totalInvestment = equity + acquisitionTax + legalFees;

        // 2. Returns
        const annualInterest = loanAmount * (interestRate / 100);
        const capitalGains = salePrice - bidPrice;
        const netProfit = capitalGains - acquisitionTax - legalFees - annualInterest;
        const roe = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

        // 3. AI Probability Mock (Heuristic)
        // If bid is close to appraisal (e.g. 90%+), high probability.
        // If bid is low (e.g. <70%), low probability.
        const ratio = bidPrice / appraisalPrice;
        let prob = 0;
        if (ratio > 1.0) prob = 98;
        else if (ratio > 0.9) prob = 85 + (ratio - 0.9) * 100;
        else if (ratio > 0.8) prob = 60 + (ratio - 0.8) * 200;
        else prob = ratio * 50;

        setResults({
            totalInvestment,
            loanAmount,
            acquisitionTax,
            annualInterest,
            capitalGains,
            netProfit,
            roe,
            winningProbability: Math.min(Math.floor(prob), 99)
        });
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: Number(value) }));
    };

    const formatMoney = (n: number) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(n);

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <motion.button
                    className="yield-fab"
                    onClick={() => setIsOpen(true)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        left: '30px', // Moved to left to avoid overlap with AI Concierge
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-gold) 0%, #b8860b 100%)',
                        border: 'none',
                        boxShadow: '0 10px 25px rgba(212,175,55,0.4)',
                        color: 'white',
                        fontSize: '24px',
                        zIndex: 1000,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <i className="fas fa-calculator"></i>
                </motion.button>
            )}

            {/* Calculator Modal/Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="yield-panel"
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            width: '400px',
                            height: '100vh',
                            background: 'rgba(10, 25, 47, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderLeft: '1px solid rgba(212,175,55,0.3)',
                            padding: '30px',
                            zIndex: 1001,
                            overflowY: 'auto',
                            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={{ color: 'var(--accent-gold)', fontSize: '1.5rem', fontFamily: '"Playfair Display", serif' }}>
                                <i className="fas fa-robot" style={{ marginRight: '10px' }}></i>
                                AI Yield Analyst
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Winning Probability Gauge */}
                        <div className="winning-gauge" style={{ textAlign: 'center', marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '10px' }}>AI 낙찰 확률 예측</div>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: results.winningProbability > 70 ? '#4ade80' : results.winningProbability > 40 ? '#facc15' : '#ff6b6b' }}>
                                {results.winningProbability}%
                            </div>
                            <div style={{ height: '6px', background: '#333', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${results.winningProbability}%` }}
                                    style={{ height: '100%', background: results.winningProbability > 70 ? '#4ade80' : results.winningProbability > 40 ? '#facc15' : '#ff6b6b' }}
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>입찰가 (Bid Price)</label>
                            <input
                                type="number"
                                name="bidPrice"
                                value={inputs.bidPrice}
                                onChange={handleInput}
                                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', borderRadius: '8px', color: '#fff', fontSize: '1.1rem' }}
                            />
                        </div>

                        <div className="input-group" style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>예상 매도가 (Target Price)</label>
                            <input
                                type="number"
                                name="salePrice"
                                value={inputs.salePrice}
                                onChange={handleInput}
                                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', borderRadius: '8px', color: '#fff', fontSize: '1.1rem' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>대출 비율 (%)</label>
                                <input
                                    type="number"
                                    name="loanRate"
                                    value={inputs.loanRate}
                                    onChange={handleInput}
                                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', borderRadius: '8px', color: '#fff' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '8px', fontSize: '0.9rem' }}>금리 (%)</label>
                                <input
                                    type="number"
                                    name="interestRate"
                                    value={inputs.interestRate}
                                    onChange={handleInput}
                                    step="0.1"
                                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', borderRadius: '8px', color: '#fff' }}
                                />
                            </div>
                        </div>

                        <div className="results-summary" style={{ borderTop: '1px solid #333', paddingTop: '20px' }}>
                            <ResultRow label="총 투자금 (Equity)" value={formatMoney(results.totalInvestment)} />
                            <ResultRow label="대출금 (Loan)" value={formatMoney(results.loanAmount)} />
                            <ResultRow label="취등록세/비용" value={formatMoney(results.acquisitionTax + (inputs.bidPrice * 0.005))} />
                            <div style={{ margin: '15px 0', borderBottom: '1px dashed #333' }}></div>
                            <ResultRow label="순이익 (Net Profit)" value={formatMoney(results.netProfit)} highlight={true} />

                            <div style={{ marginTop: '20px', padding: '15px', background: 'linear-gradient(90deg, rgba(212,175,55,0.1) 0%, transparent 100%)', borderRadius: '8px', borderLeft: '4px solid var(--accent-gold)' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', marginBottom: '5px' }}>예상 수익률 (ROE)</div>
                                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>{results.roe.toFixed(2)}%</div>
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const ResultRow = ({ label, value, highlight = false }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ color: highlight ? '#fff' : '#888', fontWeight: highlight ? 'bold' : 'normal' }}>{label}</span>
        <span style={{ color: highlight ? 'var(--accent-gold)' : '#eee', fontWeight: highlight ? 'bold' : 'normal', fontSize: highlight ? '1.1rem' : '1rem' }}>{value}</span>
    </div>
);
