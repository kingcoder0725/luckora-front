import { Helmet } from 'react-helmet-async';
import { APP_NAME } from 'src/config-global';
// sections
import PageView from 'src/sections/user/notification/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {APP_NAME} : Notification</title>
        <meta
          name="description"
          content="Stay informed with Webet360 notifications. Get updates on bonuses, game events, and account activities."
        />
        <meta
          name="keywords"
          content="Webet360 notifications, casino updates, betting alerts, game event notifications, account updates"
        />
      </Helmet>

      <PageView />
    </>
  );
}