# GAJA AUCTION & NPL Consulting Platform
>
> Hyper-Intelligent Real Estate Investment Platform

**가자경매NPL컨설팅**은 AI 기반의 NPL 분석 및 경매 컨설팅을 제공하는 하이엔드 플랫폼입니다.

![GAJA Logo](./src/assets/images/logo.png)

## 🚀 Key Features

* **AI Yield Calculator**: 복잡한 NPL 수익률, 관련 세금, 대출 이자를 자동으로 계산하고 그래프로 시각화합니다.
* **Trust Layer**: 블록체인 기술을 모방한 신뢰도 배지 시스템을 통해 매물의 안정성을 보증합니다.
* **AI Concierge**: 24/7 실시간 상담이 가능한 AI 챗봇 비서가 투자자 원을 담당합니다.
* **Live NPL Market Ticker**: 실시간 NPL 시장 현황을 월스트리트 스타일의 티커로 제공합니다.
* **Interactive Map Search**: 직관적인 지도 기반 인터페이스로 전국의 우량 물건을 탐색할 수 있습니다.

## 🛠 Tech Stack

* **Frontend**: React (Vite), Framer Motion, Leaflet, Recharts
* **Backend (Data)**: Supabase (PostgreSQL)
* **Authentication**: Supabase Auth (Admin System)
* **Deployment**: Vercel / Netlify ready

## 📦 Installation & Setup

1. **Clone the repository**

    ```bash
    git clone https://github.com/your-username/gaja-auction-app.git
    cd gaja-auction-app
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Environment Setup**
    * Rename `.env.example` to `.env` (or create one).
    * Add your Supabase credentials:

        ```
        VITE_SUPABASE_URL=your_supabase_url
        VITE_SUPABASE_ANON_KEY=your_anon_key
        ```

4. **Run Development Server**

    ```bash
    npm run dev
    ```

## 📂 Project Structure

```
src/
├── components/     # Reusable UI Components
├── pages/          # Application Pages (Routes)
├── utils/          # Helper Functions & DataManager
├── data/           # Mock Data (initial seed)
├── assets/         # Images & Fonts
└── lib/            # External library configs (Supabase)
```

## 📝 License

This project is proprietary software of GAJA AUCTION NPL.
