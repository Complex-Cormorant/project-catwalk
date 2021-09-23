/**
 * @jest-environment jsdom
 */
import React from 'react';
import 'whatwg-fetch';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import {
  act, render, screen, fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import 'regenerator-runtime/runtime';
import { Provider } from 'react-redux';
import AddToCartFeatures from '../client/src/components/Overview/AddToCart';
import Style from '../client/src/components/Overview/Style';
import mockData from './fixtures/OverviewMockData';

// MOCK ALL COMPONENT AND CSS IMPORTS TO ISOLATE OVERVIEW COMPONENT ====================
jest.mock('../client/src/components/Overview/overview.css', () => () => (<div>Placeholder Overview Style</div>));
jest.mock('../client/src/components/Overview/Gallery', () => () => (<div>Placeholder Gallery</div>));
jest.mock('../client/src/components/Q&A/QuestionsAndAnswers', () => () => (<div>Placeholder Questions And Answers</div>));
jest.mock('../client/src/components/Q&A/questions.css', () => () => (<div>Placeholder Questions And Answers Style</div>));
jest.mock('../client/src/components/Related/RelatedItems', () => () => (<div>Placeholder Questions And Answers</div>));
jest.mock('../client/src/components/Reviewlist/reviewlist.css', () => () => (<div>Review List Style</div>));
jest.mock('../client/src/components/Reviewlist/Review-list', () => () => (<div>Placeholder Review List</div>));
jest.mock('../client/src/reducers/Review-List-Slice.js', () => () => (<div>Review List Slice Placeholder</div>));

// SETUP MOCK SERVER =============================================================
const {
  mockProductData, mockStyleData, mockStyle, mockCartData, store,
} = mockData;

// declare which API requests to mock
const server = setupServer(
  rest.get('/products/48432', (req, res, ctx) => res(ctx.json(mockProductData))),
  rest.get('/products/48432/styles', (req, res, ctx) => res(ctx.json(mockStyleData))),
  rest.get('/cart', (req, res, ctx) => res(ctx.json(mockCartData))),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// TESTS =============================================================

// test('renders App on load', async () => {
//   render(
//     <Provider store={store}>
//       <App />
//     </Provider>,
//   );

//   await waitFor(() => screen.getByText('Hello World! CurrentId is 48432 and current Style is 293480'));

//   expect(screen.getByText('Placeholder Product Info')).toBeInTheDocument();
// });

test('renders Add to Cart Button on load', async () => {
  const { findAllByRole } = render(
    <Provider store={store}>
      <AddToCartFeatures style={mockStyle} />
    </Provider>,
  );

  await act(() => findAllByRole('menuitem'));

  expect(screen.getByTestId('addToCart')).toBeVisible();
});

test('shows error message on click if no size selected', async () => {
  const { findAllByRole } = render(
    <Provider store={store}>
      <AddToCartFeatures style={mockStyle} />
    </Provider>,
  );

  await act(() => findAllByRole('menuitem'));

  fireEvent.click(screen.getByTestId('addToCart'));
  expect(screen.getByText('Please select a size')).toBeInTheDocument();
});

test('quantity dropdown is no longer disabled when a size is selected', async () => {
  const { findAllByRole } = render(
    <Provider store={store}>
      <AddToCartFeatures style={mockStyle} />
    </Provider>,
  );
  // 1702764: { quantity: 8, size: 'XS' },
  fireEvent.click(screen.getByTestId('1702764'));
  await act(() => findAllByRole('menuitem'));

  await act(() => screen.findAllByText('XS'));

  expect(screen.getByTestId('qtySelector')).not.toBeDisabled();
});

// Style Selector Tests ==============================================
test('selected images should have select formatting with border and checkmark', () => {
  const style = {
    style_id: 123456,
    name: 'Selected Style',
    original_price: '0',
    photos: [
      { thumbnail_url: 'https://testing.com' },
    ],
  };
  const { getByAltText } = render(
    <Provider store={store}>
      <Style style={style} />
    </Provider>,
  );

  fireEvent.click(getByAltText('Selected Style'));
  expect(getByAltText('Selected Style')).toHaveClass('overview-style-selected');
});
