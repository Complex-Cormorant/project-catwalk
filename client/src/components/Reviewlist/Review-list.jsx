/* eslint-disable import/extensions */
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetReviewsQuery, useGetMetaReviewsQuery, useGetProductInfoQuery } from '../../reducers/Review-List-Slice';
import ReviewModal from './Review-Modal.jsx';
import './reviewlist.css';
import Tile from './Tile.jsx';

const ReviewsAndRatings = () => {
  const [sortBy, setSort] = useState(() => 'helpful');
  const [count, setCount] = useState(() => 2);
  const [show, setShow] = useState(() => false);
  const productId = useSelector((state) => state.product.id);

  useEffect(() => {
    setCount(2);
    setSort('helpful');
  }, [productId]);

  const showModal = () => {
    setShow(true);
  };
  const hideModal = () => {
    setShow(false);
  };

  const {
    data: reviews,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetReviewsQuery(
    {
      productId,
      count,
      sort: sortBy,
    },
  );
  const {
    data: productInfo,
    isSuccess: infoSuccess,
  } = useGetProductInfoQuery(productId);

  const {
    data: reviewInfo,
    isSuccess: reviewInfoSuccess,
  } = useGetMetaReviewsQuery(productId);

  let dropdown;
  let content;
  let moreReviews;
  let addReview;

  if (isLoading) {
    content = (
      <p>
        Loading...zzz, this request might be taking some time
      </p>
    );
  } else if (isSuccess && infoSuccess && reviewInfoSuccess) {
    dropdown = (
      <>
        {reviews.results.length}
        &nbsp;reviews, sorted by&nbsp;
        <div className="dropdown">
          {sortBy}
          <div className="dropdown-content">
            <option onClick={() => setSort('helpful')}>helpful</option>
            <option onClick={() => setSort('relevant')}>relevant</option>
            <option onClick={() => setSort('newest')}>recent</option>
          </div>
        </div>
      </>
    );
    content = reviews.results.map((review) => (
      <Tile key={review.review_id} review={review} />
    ));
    addReview = (
      <>
        <ReviewModal
          show={show}
          handleClose={hideModal}
          product={productInfo}
          reviewInfo={reviewInfo}
        />
        <button
          className="more-reviews"
          type="button"
          onClick={showModal}
        >
          Add a Review +
        </button>
      </>
    );
    if (count === reviews.results.length) {
      moreReviews = (
        <>
          <button
            className="more-reviews"
            type="button"
            onClick={() => {
              setCount((prevCount) => prevCount + 2);
            }}
          >
            More Reviews
          </button>
        </>
      );
    }
  } else if (isError) {
    content = (
      <p>
        {error.toString()}
      </p>
    );
  }

  return (
    <>
      <h4> Ratings & Reviews</h4>
      <div className="container">
        <div className=".item-ratings">
          Ratings Placeholder
        </div>
        <div className="item-reviews">
          {dropdown}
          {content}
          {moreReviews}
          {addReview}
        </div>
      </div>
    </>
  );
};

export default ReviewsAndRatings;
