/* eslint-disable import/extensions */
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateView } from '../../reducers/Example-Reducer';

import GalleryThumbnail from './GalleryThumbnail.jsx';
import './overview.css';

const Gallery = () => {
  const dispatch = useDispatch();
  const selectedStyle = useSelector((state) => state.style.style);
  const stylePhotos = useSelector((state) => state.style.photos);
  const expandedView = useSelector((state) => state.product.expandedView);

  const [mainPhotoIndex, setPhotoIndex] = useState(0);
  const [zoomView, setZoomView] = useState(false);

  const mainImage = stylePhotos[mainPhotoIndex];

  // sets the main image based on index o thumbnail selected
  const selectPhoto = (index) => {
    setPhotoIndex(index);
  };

  const moveUp = () => {
    if (mainPhotoIndex > 0) {
      setPhotoIndex(mainPhotoIndex - 1);
    }
  };

  const moveDown = () => {
    if (mainPhotoIndex < stylePhotos.length - 1) {
      setPhotoIndex(mainPhotoIndex + 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 37 || e.keyCode === 38) { // left or up
      moveUp();
    } else if (e.keyCode === 39 || e.keyCode === 40) { // right or down
      moveDown();
    }
  };

  const renderUpArrow = () => {
    if (stylePhotos.length > 7 && mainPhotoIndex > 0) {
      return (
        <span role="button" tabIndex="-1" onClick={() => moveUp()} onKeyDown={() => handleKeyDown()}>
          <img className="overview-thumbnail-arrow" alt="up arrow" src="./images/up-arrow.png" />
        </span>
      );
    }
    return null;
  };

  const renderDownArrow = () => {
    if (stylePhotos.length > 7 && mainPhotoIndex < stylePhotos.length - 1) {
      return (
        <span role="button" tabIndex="-1" onClick={() => moveDown()} onKeyDown={() => handleKeyDown()}>
          <img className="overview-thumbnail-arrow" alt="down arrow" src="./images/down-arrow.png" />
        </span>
      );
    }
    return null;
  };

  const renderLeftArrow = () => {
    if (mainPhotoIndex > 0) {
      return (
        <span role="button" tabIndex="-1" onClick={() => moveUp()} onKeyDown={() => handleKeyDown()}>
          <img className="overview-main-arrow left" alt="left arrow" src="./images/double-left-arrow.png" />
        </span>
      );
    }
    return null;
  };

  const renderRightArrow = () => {
    if (mainPhotoIndex < stylePhotos.length - 1) {
      return (
        <span role="button" tabIndex="-1" onClick={() => moveDown()} onKeyDown={() => handleKeyDown()}>
          <img className="overview-main-arrow right" alt="right arrow" src="./images/double-right-arrow.png" />
        </span>
      );
    }
    return null;
  };

  const toggleView = () => {
    dispatch(() => updateView(true));
  };

  const toggleZoom = () => {
    dispatch(() => setZoomView(!zoomView));
  };

  const renderMainImage = () => {
    if (zoomView) {
      return (
        <div
          className="overview-main-image-zoom"
          onClick={() => toggleZoom()}
          onKeyPress={() => toggleZoom()}
          onMouseEnter={() => dragElement()}
          role="link"
          tabIndex="-1"
        >
          <img src={mainImage.url} alt={selectedStyle.name} title={selectedStyle.name} />
        </div>
      );
    }
    if (expandedView) {
      return (
        <div
          className="overview-main-image-expanded"
          onClick={() => toggleZoom()}
          onKeyPress={() => toggleZoom()}
          onMouseEnter={() => dragElement()}
          role="link"
          tabIndex="-1"
        >
          <img src={mainImage.url} alt={selectedStyle.name} title={selectedStyle.name} />
        </div>
      );
    }
    return (
      <div className="overview-main-image">
        <img src={mainImage.url} alt={selectedStyle.name} title={selectedStyle.name} />
      </div>
    );
  };

  // zoom and drag function
  let pos1 = 0; let pos2 = 0; let pos3 = 0; let pos4 = 0;

  const dragElement = (elmnt) => {
    const elementDrag = (e) => {
      // e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = `${elmnt.offsetTop - pos2}px`;
      elmnt.style.left = `${elmnt.offsetLeft - pos1}px`;
    };

    const dragMouseDown = (e) => {
      // e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    };

    elmnt.onmousedown = dragMouseDown;

    const closeDragElement = () => {
    // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    };
  };

  if (!mainImage) {
    return <div>Loading Images...</div>;
  }
  return (
    <>
      <div className="overview-gallery-container">
        <div
          className="overview-main-image-container"
          onClick={() => toggleView()}
          onKeyPress={() => toggleView()}
          role="link"
          tabIndex="-1"
        >
          {renderMainImage()}
          {/* <img
            className={if (expandedView) ? "overview-main-image-expanded" : "overview-main-image"}
            src={mainImage.url}
            alt={selectedStyle.name}
            title={selectedStyle.name}
          /> */}
        </div>
        <div className="overview-thumbnail-container">
          {renderUpArrow()}
          <div className="overview-thumbnail-image-container">
            {stylePhotos.map((photo, index) => (
              <GalleryThumbnail
                key={photo.url}
                style={selectedStyle}
                photo={photo}
                index={index}
                selectPhoto={selectPhoto}
                mainPhotoIndex={mainPhotoIndex}
              />
            ))}
          </div>
          {renderDownArrow()}
        </div>
        <div className="overview-main-arrow-container">
          {renderLeftArrow()}
          {renderRightArrow()}
        </div>
      </div>
    </>
  );
};

export default Gallery;
