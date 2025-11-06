import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// layouts
import GlobalLayout from 'src/layouts/global';
// components
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// const IndexPage = lazy(() => import('src/pages'));
const FAQPage = lazy(() => import('src/pages/home/faq'));
const AboutUs = lazy(() => import('src/pages/home/aboutus'));
const PrivacyPolicy = lazy(() => import('src/pages/home/privacypolice'));
const Cookies = lazy(() => import('src/pages/home/cookies'));
const KycUpload = lazy(() => import('src/pages/home/kycUpload'));

export const mainRoutes = [
  {
    path: '',
    element: (
      <GlobalLayout>
        <Suspense fallback={<LoadingScreen sx={{ height: "70vh" }} />}>
          <Outlet />
        </Suspense>
      </GlobalLayout>
    ),
    children: [
      { path: 'faq', element: <FAQPage /> },
      { path: 'aboutus', element: <AboutUs /> },
      { path: 'privacypolicy', element: <PrivacyPolicy /> },
      { path: 'cookies', element: <Cookies /> },
      { path: 'kyc/upload', element: <KycUpload /> },
    ],
  },
];