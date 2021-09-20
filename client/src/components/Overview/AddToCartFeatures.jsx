/* eslint-disable import/extensions */
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
// eslint-disable-next-line no-unused-vars
import overviewStyling from './overview.css';

const AddToCartFeatures = () => {
  // identify skus in stock
  let availableSkus = [];
  const selectedSkus = useSelector((state) => state.style.skus);
  if (selectedSkus !== undefined) {
    availableSkus = Object.entries(selectedSkus).filter((sku) => sku[1].quantity > 0);
  }

  // set initial sku, quantity, size, views and cart
  const [selectSku, setSku] = useState(availableSkus[0]);
  const [selectQty, setQty] = useState(1);
  const [selectSize, setSize] = useState('Select Size');
  const [isQtyShown, showQty] = useState(false);
  const [areSizesOpen, showSizes] = useState(false);
  const [error, showError] = useState(false);
  const [cart, addToCart] = useState([]);
  const [apiCart, addToAPICart] = useState([]);

  // reset views when rendering new style
  const resetDefault = () => {
    setSku(availableSkus[0]);
    setSize('Select Size');
    showQty(false);
    showSizes(false);
    showError(false);
  };
  useEffect(resetDefault, [selectedSkus]);

  // QUANTITY SELECTOR ========================================================
  // Should this account for multiple skus with the same size? I'm currently assuming all unique.
  // In default style, should sku 1702769 be 'XXL' instead?
  //   1702768: {quantity: 15, size: 'XL'}
  //   1702769: {quantity: 4, size: 'XL'}

  // Find the available quantity of the sku
  let availableQty = 0;
  // let userCart = [];
  // Retrieves list of products added to the cart by a user
  const getCart = () => {
    axios.get('/cart')
      .then((response) => {
        const cartData = response.data;
        addToAPICart(cartData);
        console.log('cartData', cartData);
        const newCart = {};
        cartData.forEach((item) => {
          console.log(item);
          newCart[item.sku_id] = item.count;
        });
        console.log(newCart);
        return newCart;
      })
      .then((newCart) => {
        if (selectSku !== undefined) {
          const skuId = selectSku[0];
          const cartQty = !newCart[skuId] ? 0 : newCart[skuId];
          console.log('cartQty', cartQty);
          availableQty = selectSku[1].quantity - cartQty;
          console.log('availableQty', availableQty);
        }
      })
      .catch((err) => console.log('Error getting all styles:', err));
  };

  useEffect(getCart, [selectSku]);

  // if (selectSku !== undefined) {
  //   // const cartItem = 0;
  //   const cartItem = apiCart.find((item) => selectSku[0] === item.sku_id);
  //   console.log('cartItem', cartItem);
  //   availableQty = selectSku[1].quantity - cartItem.count;
  // }

  const qtySelector = () => {
    // show max of 15 in dropdown
    const listedQty = availableQty > 15 ? 15 : availableQty;
    const options = [...Array(listedQty + 1).keys()].slice(1);
    return options.map((i) => <option key={selectSku[0] + i} className="dropdown-content" value={i}>{i}</option>);
  };

  const handleQtyChange = (e) => {
    setQty(e.target.value);
  };

  const renderQtySelector = () => {
    // only show Qty dropdown if size is selected and in stock
    if (isQtyShown && availableQty > 0) {
      return (
        <select className="dropdown" name="activeQtySelector" onChange={handleQtyChange}>{qtySelector()}</select>
      );
    } return (
      <select className="dropdown" name="disabledQtySelector" disabled>
        <option defaultValue="-">-</option>
      </select>
    );
  };

  // SIZE SELECTOR ========================================================
  // when a size is selected, show quantity dropdown and close size dropdown
  const handleSizeInput = (inputSize) => {
    setSize(inputSize);
    if (inputSize === 'Select Size') {
      showQty(false);
      setSku(availableSkus[0]);
    } else {
      const matchingSku = availableSkus.find((sku) => inputSize === sku[1].size);
      setSku(matchingSku);
      showQty(true);
      showSizes(false);
      showError(false);
    }
  };

  // find the sizes for skus in stock
  const availableSizes = availableSkus.map(
    (sku) => (
      <li
        key={sku[0]}
        className="size"
        role="menuitem"
        tabIndex="-1"
        onClick={() => handleSizeInput(sku[1].size)}
        onKeyPress={() => handleSizeInput(sku[1].size)}
      >
        {sku[1].size}
      </li>
    ),
  );

  const renderSizeSelector = () => {
    // if no size is chosen, clicking Add to Cart opens Select Size Dropdown
    if (availableQty > 0) {
      return (
        <>
          <div className={error ? 'help-text' : 'help-text-space'}>{error ? 'Please select a size' : ''}</div>
          <div className="size-dropdown">
            <button
              className="size-dropdown-btn"
              type="submit"
              onClick={() => { showSizes(!areSizesOpen); }}
            >
              {selectSize}
            </button>
            <ul className={areSizesOpen ? 'size-options-open' : 'size-options'}>
              <li
                key="selectSize"
                className="size"
                role="menuitem"
                tabIndex="-1"
                onClick={() => {
                  handleSizeInput('Select Size');
                  showSizes(false);
                }}
                onKeyPress={() => {
                  handleSizeInput('Select Size');
                  showSizes(false);
                }}
              >
                -
              </li>
              {availableSizes}
            </ul>
          </div>
        </>
      );
    // Show OUT OF STOCK if no stock
    } return (
      <>
        <div className="help-text-space" />
        <div className="size-dropdown">
          <button
            className="size-dropdown-btn"
            type="submit"
          >
            OUT OF STOCK
          </button>
        </div>
      </>
    );
  };

  // ADD TO CART BUTTON ========================================================
  const postToCartOnce = (skuId) => {
    axios.post('/cart', { sku_id: skuId })
      .then((response) => response.status)
      .catch((err) => console.log('Error posting to cart', err));
  };

  const handleClick = () => {
    // if clicked without selecting a size, show error message and open size dropdown
    if (selectSize === 'Select Size') {
      showError(true);
      showSizes(true);
    } else {
      const item = {
        sku_id: selectSku[0],
        count: selectQty,
      };
      addToCart([...cart, item]);
      for (let i = 0; i < selectQty; i += 1) {
        postToCartOnce(selectSku[0]);
      }
      resetDefault();
    }
  };

  const renderButton = () => {
    if (availableQty > 0) {
      return (
        <div>
          <button className="addToCart" type="submit" onClick={handleClick}>Add to Cart</button>
        </div>
      );
    }
    // Hide Add to Cart button if no stock available
    return <div />;
  };

  if (!selectSku) {
    return <div>Checking our inventory...</div>;
  }
  return (
    <div className="addToCart-container">
      {renderSizeSelector()}
      {renderQtySelector()}
      {renderButton()}
      <div className="heart-icon" />
    </div>
  );
};

export default AddToCartFeatures;
