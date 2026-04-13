import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageview } from '../lib/analytics';
import { initWebVitals } from '../lib/webVitals';

export default function AnalyticsListener() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
    initWebVitals();
  }, []);

  useEffect(() => {
    trackPageview(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}
