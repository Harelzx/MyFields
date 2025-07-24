import { I18nManager } from 'react-native';

/**
 * Bootstrap RTL configuration for the application
 * This should be called early in the app initialization
 */
export const bootstrapRTL = () => {
  try {
    // Enable RTL support
    I18nManager.allowRTL(true);
    
    // Force RTL for Hebrew language
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      console.warn('⚠️ RTL configuration changed - restart required');
    } else {
      console.log('✅ RTL is properly enabled');
    }
    
    console.log('RTL Status:', {
      isRTL: I18nManager.isRTL,
      allowRTL: true,
      platform: 'expo'
    });
  } catch (error) {
    console.error('RTL initialization error:', error);
  }
};