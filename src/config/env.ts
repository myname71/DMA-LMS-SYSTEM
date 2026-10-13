const ENV = {
  API_BASE: '',
  APP_NAME: 'Digital Manufacturing Academy',
  APP_VERSION: '2.0.0',
  SUPPORT_EMAIL: 'info@digitalmanufacturing.academy',
  MAX_UPLOAD_MB: 10,
  SESSION_KEY: 'dma_auth_session',
  DEFAULT_AVATAR: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  QUIZ_PASS_THRESHOLD: 70,
  FEATURES: {
    AI_TUTOR: true,
    PAYMENTS: false,
    GOOGLE_DRIVE: false,
    PWA: false,
    NOTIFICATIONS: true,
  },
} as const;

export default ENV;
