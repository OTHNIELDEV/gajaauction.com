import React from 'react';

const Stats = () => {
    return (
        <section className="stats">
            <div className="container grid-3">
                <div className="stat-item">
                    <h3>10+</h3>
                    <p>Years Experience</p>
                </div>
                <div className="stat-item">
                    <h3>98%</h3>
                    <p>Auction Success Rate</p>
                </div>
                <div className="stat-item">
                    <h3>1,000억+</h3>
                    <p>누적 투자 유치액</p>
                </div>
            </div>
        </section>
    );
};

export default Stats;
