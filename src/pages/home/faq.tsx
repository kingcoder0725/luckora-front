import { Helmet } from 'react-helmet-async';
import { APP_NAME } from 'src/config-global';
// sections
import PageView from 'src/sections/home/faq';

// ----------------------------------------------------------------------

export default function Page() {
    return (
        <>
            <Helmet>
                <title>{APP_NAME} : FAQ</title>
                <meta
                    name="description"
                    content="Find answers to common questions about Drifbet's online casino, games, bonuses, and account management in our FAQ."
                />
                <meta
                    name="keywords"
                    content="Drifbet FAQ, casino FAQ, online gaming questions, casino bonuses, account help"
                />
            </Helmet>

            <PageView />
        </>
    );
}