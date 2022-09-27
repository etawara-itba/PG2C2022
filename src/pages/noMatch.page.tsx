import React from 'react';
import { useTranslation } from 'react-i18next';

const NoMatch: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t('route.noMatch.title')}</h1>
            <p>{t('route.noMatch.description')}</p>
        </div>
    );
};

export default NoMatch;
