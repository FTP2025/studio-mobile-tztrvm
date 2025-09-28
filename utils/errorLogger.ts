
import { Platform } from "react-native";

// Global error handler for unhandled promise rejections
const setupErrorLogging = () => {
  // Handle unhandled promise rejections
  if (typeof global !== 'undefined') {
    const originalHandler = global.onunhandledrejection;
    
    global.onunhandledrejection = (event: any) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      
      // Log additional details if available
      if (event.reason && typeof event.reason === 'object') {
        console.error('Error details:', {
          message: event.reason.message,
          stack: event.reason.stack,
          name: event.reason.name,
        });
      }
      
      // Call original handler if it exists
      if (originalHandler) {
        originalHandler(event);
      }
      
      // Prevent the default behavior (which would crash the app)
      event.preventDefault();
    };
  }

  // Handle uncaught exceptions
  if (typeof global !== 'undefined' && global.ErrorUtils) {
    const originalHandler = global.ErrorUtils.getGlobalHandler();
    
    global.ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
      console.error('Global Error Handler:', error, 'isFatal:', isFatal);
      
      // Log additional details
      if (error && typeof error === 'object') {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      
      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
};

const clearErrorAfterDelay = (errorKey: string) => {
  setTimeout(() => {
    console.log(`Clearing error: ${errorKey}`);
  }, 5000);
};

const sendErrorToParent = (level: string, message: string, data?: any) => {
  try {
    console.log(`[${level.toUpperCase()}] ${message}`, data || '');
    
    // Additional error reporting could go here
    if (level === 'error') {
      console.error('Error reported:', message, data);
    }
  } catch (error) {
    console.error('Failed to send error to parent:', error);
  }
};

const extractSourceLocation = (stack: string): string => {
  try {
    if (!stack) return 'Unknown location';
    
    const lines = stack.split('\n');
    for (const line of lines) {
      if (line.includes('.js:') || line.includes('.ts:') || line.includes('.tsx:')) {
        const match = line.match(/([^/\\]+\.(js|ts|tsx)):(\d+):(\d+)/);
        if (match) {
          return `${match[1]}:${match[3]}:${match[4]}`;
        }
      }
    }
    
    return 'Unknown location';
  } catch (error) {
    console.error('Error extracting source location:', error);
    return 'Unknown location';
  }
};

const getCallerInfo = (): string => {
  try {
    const stack = new Error().stack;
    if (!stack) return 'Unknown caller';
    
    return extractSourceLocation(stack);
  } catch (error) {
    console.error('Error getting caller info:', error);
    return 'Unknown caller';
  }
};

export {
  setupErrorLogging,
  clearErrorAfterDelay,
  sendErrorToParent,
  extractSourceLocation,
  getCallerInfo,
};
