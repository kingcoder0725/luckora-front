import { Helmet } from 'react-helmet-async';
import { APP_NAME } from 'src/config-global';
// sections
import View from 'src/sections/casino/original/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{APP_NAME} : Games</title>
        <meta
          name="description"
          content="Enjoy exclusive original games at Webet360! Unique slots, arcade-style games, and innovative casino experiences await."
        />
        <meta
          name="keywords"
          content="original casino games, exclusive slots, arcade casino games, unique casino experiences, Webet360 games"
        />
      </Helmet>

      <View />
    </>
  );
}