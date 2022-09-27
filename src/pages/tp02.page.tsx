import React from 'react';
import { useTranslation } from 'react-i18next';

const Tp02: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t('route.tp02.title')}</h1>
        </div>
    );
};

export default Tp02;
