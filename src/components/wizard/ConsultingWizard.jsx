import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
import DataManager from '../../utils/DataManager';

const ConsultingWizard = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        interest: '',
        budget: '',
        name: '',
        phone: ''
    });
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState(null);

    const totalSteps = 4;

    const handleNext = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));

        // If this is the last step (phone input), trigger send
        if (key === 'phone') {
            sendEmail({ ...formData, phone: value });
        } else {
            setStep(prev => prev + 1);
        }
    };

    const sendEmail = async (data) => {
        setIsSending(true);
        setSendError(null);

        // TODO: Replace with your actual EmailJS Service ID, Template ID, and Public Key
        // You can get these from https://dashboard.emailjs.com/
        const SERVICE_ID = "YOUR_SERVICE_ID";
        const TEMPLATE_ID = "YOUR_TEMPLATE_ID";
        const PUBLIC_KEY = "YOUR_PUBLIC_KEY";

        try {
            // Simulate API call if keys are not set
            if (SERVICE_ID === "YOUR_SERVICE_ID") {
                console.log("EmailJS keys not set. Simulating success with data:", data);
                await new Promise(resolve => setTimeout(resolve, 1500));
            } else {
                await emailjs.send(SERVICE_ID, TEMPLATE_ID, data, PUBLIC_KEY);
            }

            // Save to Admin DataManager
            DataManager.init();
            DataManager.addInquiry({
                name: data.name || "익명 고객",
                phone: data.phone,
                interest: data.interest,
                budget: data.budget
            });

            setStep(4); // Move to Success Step
        } catch (error) {
            console.error("Email sending failed:", error);
            setSendError("전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
            // Determine if we should stay on step 3 or move to an error step
            // For now, stay on step 3 so they can retry
        } finally {
            setIsSending(false);
        }
    };

    const resetWizard = () => {
        setStep(1);
        setFormData({ interest: '', budget: '', name: '', phone: '' });
        setIsSending(false);
        setSendError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ display: 'flex' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="modal-content glass-card"
                style={{ maxWidth: '600px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}
            >
                <span className="close-modal" onClick={resetWizard}>&times;</span>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginBottom: '30px', borderRadius: '2px' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                        style={{ height: '100%', background: 'var(--accent-gold)' }}
                    />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <AnimatePresence mode='wait'>
                        {/* Step 1 & 2 remain the same */}
                        {step === 1 && (
                            <WizardStep key="step1" title="어떤 분야에 관심이 있으신가요?">
                                <OptionButton label="NPL 부실채권 투자" onClick={() => handleNext('interest', 'NPL')} />
                                <OptionButton label="법원 경매 낙찰" onClick={() => handleNext('interest', 'Auction')} />
                                <OptionButton label="보유 자산 매각/처분" onClick={() => handleNext('interest', 'Sale')} />
                            </WizardStep>
                        )}

                        {step === 2 && (
                            <WizardStep key="step2" title="투자가능 하신 예산 규모는?">
                                <OptionButton label="10억 미만 (소액/실거주)" onClick={() => handleNext('budget', '<1b')} />
                                <OptionButton label="10억 ~ 50억 (수익형)" onClick={() => handleNext('budget', '1b-5b')} />
                                <OptionButton label="50억 이상 (빌딩/개발)" onClick={() => handleNext('budget', '>5b')} />
                            </WizardStep>
                        )}

                        {step === 3 && (
                            <WizardStep key="step3" title="상세 리포트를 위한 정보를 입력해주세요.">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="성함 (Name)"
                                        className="wizard-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--glass-border)',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1.1rem'
                                        }}
                                        disabled={isSending}
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            placeholder="연락처 (010-0000-0000)"
                                            className="wizard-input"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            style={{
                                                flex: 1,
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid var(--glass-border)',
                                                padding: '15px',
                                                borderRadius: '8px',
                                                color: 'white',
                                                fontSize: '1.1rem'
                                            }}
                                            disabled={isSending}
                                        />
                                        <button
                                            className="btn-primary"
                                            onClick={() => handleNext('phone', formData.phone)}
                                            disabled={!formData.phone || !formData.name || isSending}
                                            style={{ minWidth: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            {isSending ? <i className="fas fa-spinner fa-spin"></i> : "완료"}
                                        </button>
                                    </div>
                                </div>
                                {sendError && <p style={{ color: '#ff6b6b', marginTop: '10px', fontSize: '0.9rem' }}>{sendError}</p>}
                            </WizardStep>
                        )}

                        {step === 4 && (
                            <WizardStep key="step4" title="신청이 완료되었습니다.">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    style={{ fontSize: '4rem', color: 'var(--accent-gold)', marginBottom: '20px' }}
                                >
                                    <i className="fas fa-check-circle"></i>
                                </motion.div>
                                <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem', marginBottom: '30px' }}>
                                    담당 파트너가 분석 후 24시간 이내에<br />
                                    <strong style={{ color: 'white' }}>VIP 시크릿 리포트</strong>를 보내드리겠습니다.
                                </p>
                                <button className="btn-outline" onClick={resetWizard}>닫기</button>
                            </WizardStep>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

const WizardStep = ({ children, title }) => (
    <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ textAlign: 'center' }}
    >
        <h2 style={{ fontSize: '2rem', marginBottom: '40px', lineHeight: '1.3' }}>{title}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
            {children}
        </div>
    </motion.div>
);

const OptionButton = ({ label, onClick }) => (
    <button
        onClick={onClick}
        className="btn-option"
        style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--glass-border)',
            padding: '18px',
            borderRadius: '12px',
            color: 'var(--text-off-white)',
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
            e.currentTarget.style.borderColor = 'var(--accent-gold)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        }}
    >
        {label} <i className="fas fa-chevron-right" style={{ fontSize: '0.8rem', opacity: 0.5 }}></i>
    </button>
);

export default ConsultingWizard;
