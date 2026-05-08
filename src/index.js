import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SellerProvider } from "./context/SellerContext";
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from "./context/OrderContext";
import { UIProvider } from './context/UIContext';
import { CommunityProvider } from './context/CommunityContext';
import { EventProvider } from './context/EventContext';
import { TutorialProvider } from './context/TutorialContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <UIProvider>
      <SellerProvider>
        <OrderProvider>
          <AuthProvider>
            <ProductProvider>
              <CartProvider>
                <CommunityProvider>
                  <EventProvider>
                    <TutorialProvider>
                      <App />
                    </TutorialProvider>
                  </EventProvider>
                </CommunityProvider>
              </CartProvider>
            </ProductProvider>
          </AuthProvider>
        </OrderProvider>
      </SellerProvider>
    </UIProvider>
  </React.StrictMode>
);

reportWebVitals();