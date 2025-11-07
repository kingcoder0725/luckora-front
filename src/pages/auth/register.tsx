import { Helmet } from 'react-helmet-async';
import { APP_NAME } from 'src/config-global';
// sections
import { RegisterView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function RegisterPage() {
  return (
    <>
      <Helmet>
        <title>{APP_NAME} : Register</title>
        <meta
          name="description"
          content="Join BetCasino555 today! Register to access exciting casino games, live dealers, and exclusive bonuses."
        />
        <meta
          name="keywords"
          content="casino register, BetCasino555 sign up, online casino registration, live casino bonuses, gaming sign up"
        />
      </Helmet>

      <RegisterView />
    </>
  );
}