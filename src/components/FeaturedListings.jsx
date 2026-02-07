import React from 'react';
import { Link } from 'react-router-dom';
import gangnamImg from '../assets/images/gangnam.png';
import pangyoImg from '../assets/images/pangyo.png';
import busanImg from '../assets/images/busan.png';

const FeaturedListings = () => {
    const listings = [
        { id: 1, img: gangnamImg, location: "서울 강남", title: "역삼동 고급 빌딩 경매", appraisal: "150억", minPrice: "105억", rate: "70%" },
        { id: 2, img: pangyoImg, location: "경기 판교", title: "IT 밸리 오피스 전용", appraisal: "28억", minPrice: "19.6억", rate: "70%" },
        { id: 3, img: busanImg, location: "부산 해운대", title: "오션뷰 펜트하우스", appraisal: "45억", minPrice: "31.5억", rate: "70%" },
    ];

    return (
        <section id="listings" className="listings">
            <div className="container">
                <div className="section-header">
                    <h2>Premium Listings</h2>
                    <p>엄선된 가자경매만의 추천 물건입니다.</p>
                </div>
                <div className="grid-3">
                    {listings.map((item) => (
                        <div className="listing-card" key={item.id}>
                            <Link to={`/listings/${item.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                <div className="listing-image placeholder-img" style={{ height: 'auto' }}>
                                    <img src={item.img} style={{ width: '100%', height: '250px', objectFit: 'cover' }} alt={item.title} />
                                </div>
                                <div className="listing-info">
                                    <span className="badge">{item.location}</span>
                                    <h3>{item.title}</h3>
                                    <p className="price"><span className="label">감정가</span> {item.appraisal}</p>
                                    <p className="min-price"><span className="label">최저가</span> <span className="highlight">{item.minPrice}</span> ({item.rate})</p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
                <div className="center-btn">
                    <Link to="/listings" className="btn-text">더 많은 물건 보기 <i className="fas fa-arrow-right"></i></Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedListings;
