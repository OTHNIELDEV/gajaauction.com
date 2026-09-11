import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description }) => {
    const defaultTitle = "(주)가자에셋파트너스";
    const defaultDesc = "전문가의 분석과 AI 예측이 결합된 대한민국 최고의 프리미엄 자산관리 & 투자 컨설팅";

    return (
        <Helmet>
            <title>{title ? `${title} | (주)가자에셋파트너스` : defaultTitle}</title>
            <meta name="description" content={description || defaultDesc} />
            <meta property="og:title" content={title ? `${title} | (주)가자에셋파트너스` : defaultTitle} />
            <meta property="og:description" content={description || defaultDesc} />
            <meta property="og:type" content="website" />
        </Helmet>
    );
};

export default SEO;
