import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
//
import App from './App';
import { store } from './store';

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <>
    <style>
      {`
        html, body {
          background-color: #1A1D29 !important;
          margin: 0;
          padding: 0;
          min-height: 100vh;
        }
        #root {
          min-height: 100vh;
        }
      `}
    </style>
    <HelmetProvider>
      <BrowserRouter>
        <Suspense>
          <Provider store={store}>
            <App />
          </Provider>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  </>
);
