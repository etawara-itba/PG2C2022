import React from 'react';
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t('route.home.title')}</h1>
        </div>
    );
};

export default Home;
