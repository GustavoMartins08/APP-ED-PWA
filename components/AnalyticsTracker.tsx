
import React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

const AnalyticsTracker: React.FC = () => {
    useAnalytics();
    return null;
};

export default AnalyticsTracker;
