import { Helmet } from 'react-helmet-async';
import { APP_NAME } from 'src/config-global';
// sections
import WalletView from 'src/sections/user/wallet/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Casino Bonus ohne Einzahlung | Startguthaben | {APP_NAME}</title>
        <meta
          name="description"
          content="Kostenloses Startguthaben & Casino Bonus ohne Einzahlung in Deutschland! Spielen Sie Slots & gewinnen Sie Echtgeld ohne Risiko."
        />
        <meta
          name="keywords"
          content="casino bonus no deposit, online casino with starting credit, best online casino offers, casino without registration Germany"
        />
      </Helmet>

      <WalletView />
    </>
  );
}
