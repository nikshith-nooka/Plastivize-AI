

import React from 'react';
import type { View } from '../App';
import { useUserData } from '../contexts/UserDataContext';
import Card from './common/Card';
import { useTranslation } from '../hooks/useTranslation';

interface HomeProps {
  navigateTo: (view: View) => void;
}



const FeatureCard: React.FC<{ emoji: string; title: string; description: string; onClick: () => void; }> = ({ emoji, title, description, onClick }) => (
    <Card
        onClick={onClick}
        className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group text-center flex flex-col items-center p-6 h-full"
    >
        <div className="text-6xl mb-4 transition-transform duration-300 group-hover:scale-110">{emoji}</div>
        <h3 className="text-xl font-bold text-brand-text">{title}</h3>
        <p className="mt-2 text-base text-brand-text-light flex-grow">{description}</p>
    </Card>
);

const Home: React.FC<HomeProps> = ({ navigateTo }) => {
    const { userData } = useUserData();
    const { username } = userData;
    const { t } = useTranslation();

    const featureCards = [
        { view: 'scanner' as View, emoji: '🔬', title: t('feature_scanner_title'), description: t('feature_scanner_desc') },
        { view: 'dashboard' as View, emoji: '📊', title: t('feature_dashboard_title'), description: t('feature_dashboard_desc') },
        { view: 'globe' as View, emoji: '🌍', title: t('feature_globe_title'), description: t('feature_globe_desc') },
        { view: 'calculator' as View, emoji: '👣', title: t('feature_calculator_title'), description: t('feature_calculator_desc') },
        { view: 'guide' as View, emoji: '📖', title: t('feature_guide_title'), description: t('feature_guide_desc') },
        { view: 'database' as View, emoji: '📚', title: t('feature_database_title'), description: t('feature_database_desc') },
        { view: 'chatbot' as View, emoji: '💬', title: t('feature_chatbot_title'), description: t('feature_chatbot_desc') },
        { view: 'community' as View, emoji: '🤝', title: t('feature_community_title'), description: t('feature_community_desc') },
        { view: 'marketplace' as View, emoji: '🛍️', title: t('feature_marketplace_title'), description: t('feature_marketplace_desc') }
    ];
    
    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
                <h1 className="text-5xl md:text-6xl font-extrabold text-brand-text">{t('homeTitle', { username: username || '' })}</h1>
                <p className="mt-4 text-xl text-brand-text-light">{t('homeSubtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featureCards.map((feature, index) => (
                    <div key={feature.view} className="animate-fade-in-up" style={{ animationDelay: `${index * 75}ms`}}>
                        <FeatureCard
                            emoji={feature.emoji}
                            title={feature.title}
                            description={feature.description}
                            onClick={() => navigateTo(feature.view)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;