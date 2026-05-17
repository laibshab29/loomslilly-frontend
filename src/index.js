import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
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
import { NotificationProvider } from './context/NotificationContext';
import { AdminProvider } from './context/AdminContext';
import { OrderHandlersBridge } from './components/OrderHandlersBridge';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <UIProvider>
      <AuthProvider>
        <SellerProvider>
          <ProductProvider>
            <NotificationProvider>
              <OrderProvider>
                <OrderHandlersBridge />
                <CartProvider>
                  <CommunityProvider>
                    <EventProvider>
                      <TutorialProvider>
                        <AdminProvider>
                          <RouterProvider router={router} />
                        </AdminProvider>
                      </TutorialProvider>
                    </EventProvider>
                  </CommunityProvider>
                </CartProvider>
              </OrderProvider>
            </NotificationProvider>
          </ProductProvider>
        </SellerProvider>
      </AuthProvider>
    </UIProvider>
  </React.StrictMode>
);

reportWebVitals();