import { post } from './apiClient';

const ANALYTICS_ENDPOINT = '/api/analytics/events';

const sendBeacon = (payload) => {
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      return navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
    }
  } catch (error) {
    // ignore beacon failures
  }
  return null;
};

export const logEvent = async (payload) => {
  const body = {
    ...payload,
    createdAt: Date.now(),
  };

  const beaconSent = sendBeacon(body);
  if (beaconSent) return true;

  try {
    await post(ANALYTICS_ENDPOINT, {
      auth: false,
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    return true;
  } catch (error) {
    console.debug('[analytics] unable to send', error.message);
    return false;
  }
};

export const logPageView = (info) =>
  logEvent({
    type: 'page_view',
    page: info?.page || (typeof window !== 'undefined' ? window.location.pathname : undefined),
    slug: info?.slug,
    label: info?.title,
    metadata: info?.metadata,
  });

export const logShare = (info) =>
  logEvent({
    type: 'share',
    page: info?.page,
    slug: info?.slug,
    label: info?.channel,
    metadata: info?.metadata,
  });

export const logEventSignup = (info) =>
  logEvent({
    type: 'event_signup',
    page: info?.page,
    slug: info?.eventId,
    label: info?.eventName,
    metadata: info?.metadata,
  });
