import { Helmet } from 'react-helmet-async';
import { APP_NAME } from 'src/config-global';
// sections
import PageView from 'src/sections/user/support/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {APP_NAME} : Support</title>
        <meta
          name="description"
          content="Get help with BetCasino555's support. Contact our team for assistance with casino games, betting, or account issues."
        />
        <meta
          name="keywords"
          content="BetCasino555 support, casino customer service, betting help, account support, online gaming assistance"
        />
      </Helmet>

      <PageView />
    </>
  );
}