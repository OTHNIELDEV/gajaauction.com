import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description }) => {
    const defaultTitle = "가자경매 NPL - Premium Real Estate Consulting";
    const defaultDesc = "전문가의 분석과 AI 예측이 결합된 대한민국 최고의 NPL & 경매 컨설팅";

    return (
        <Helmet>
            <title>{title ? `${title} | 가자경매 NPL` : defaultTitle}</title>
            <meta name="description" content={description || defaultDesc} />
            <meta property="og:title" content={title ? `${title} | 가자경매 NPL` : defaultTitle} />
            <meta property="og:description" content={description || defaultDesc} />
            <meta property="og:type" content="website" />
        </Helmet>
    );
};

export default SEO;
