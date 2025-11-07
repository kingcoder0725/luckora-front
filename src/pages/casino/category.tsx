import { Helmet } from 'react-helmet-async';
import { APP_NAME } from 'src/config-global';
// sections
import CategoryView from 'src/sections/casino/category/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{APP_NAME} : Casino</title>
        <meta
          name="description"
          content="Explore a variety of casino game categories at BetCasino555! From slots to table games, find your favorite gaming style."
        />
        <meta
          name="keywords"
          content="casino game categories, online slots, table games, live casino, BetCasino555 categories"
        />
      </Helmet>

      <CategoryView />
    </>
  );
}