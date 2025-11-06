import { Helmet } from 'react-helmet-async';
import { APP_NAME } from 'src/config-global';
// sections
import FastGamesView from 'src/sections/casino/fast_games/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{APP_NAME} : Casino</title>
        <meta
          name="description"
          content="Enjoy instant thrills with Webet360's fast games! Quick-play slots, crash games, and arcade-style fun await."
        />
        <meta
          name="keywords"
          content="fast casino games, quick play slots, crash games, arcade casino, Webet360 fast games"
        />
      </Helmet>

      <FastGamesView />
    </>
  );
}