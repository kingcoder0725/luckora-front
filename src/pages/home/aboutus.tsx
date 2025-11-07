import { Helmet } from 'react-helmet-async';
import { APP_NAME } from 'src/config-global';
// sections
import AboutUs from 'src/sections/home/aboutus';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <Helmet>
                <title>{APP_NAME} : About Us</title>
                <meta
                    name="description"
                    content="Learn about BetCasino555. Discover our mission to deliver top-tier online casino experiences with exciting games and rewards."
                />
                <meta
                    name="keywords"
                    content="about BetCasino555, online casino mission, casino games, BetCasino555 story, gaming experience"
                />
            </Helmet>

            <AboutUs />
        </>
    );
}