import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ListingCard = ({ item }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="listing-card"
        >
            <Link to={`/listings/${item.id}`} style={{ display: 'block', height: '100%' }}>
                <div className="listing-image placeholder-img" style={{ height: 'auto' }}>
                    <img src={item.img} style={{ width: '100%', height: '250px', objectFit: 'cover' }} alt={item.title} />
                </div>
                <div className="listing-info">
                    <div className="tags">
                        <span className="badge">{item.location}</span>
                        {item.tags && item.tags.slice(0, 1).map((tag, i) => (
                            <span key={i} className="badge badge-outline" style={{ marginLeft: '5px', borderColor: 'rgba(255,255,255,0.3)', color: '#ccc' }}>{tag}</span>
                        ))}
                    </div>
                    <h3>{item.title}</h3>
                    <p className="price"><span className="label">감정가</span> {item.appraisal}</p>
                    <p className="min-price"><span className="label">최저가</span> <span className="highlight">{item.minPrice}</span> ({item.rate})</p>
                </div>
            </Link>
        </motion.div>
    );
};

export default ListingCard;
