import { Client, Databases, Query, ID, Account } from "appwrite";
// Function to get the Appwrite configuration
function getConfig() {
  // Try to load from the dynamically injected window.APP_CONFIG first
  console.log("🐛 Debug env vars:", window.APP_CONFIG);
  if (window.APP_CONFIG) {
    return {
      appwriteUrl: window.APP_CONFIG.VITE_APPWRITE_URL,
      appwriteProjectId: window.APP_CONFIG.VITE_APPWRITE_PROJECT_ID,
      fastapiBaseUrl: window.APP_CONFIG.VITE_FASTAPI_BASE_URL,
      appwriteAccount: new Account(new Client().setEndpoint(window.APP_CONFIG.VITE_APPWRITE_URL).setProject(window.APP_CONFIG.VITE_APPWRITE_PROJECT_ID))
    };
  } else {
    return {
      appwriteUrl: import.meta.env.VITE_APPWRITE_ENDPOINT,
      appwriteProjectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
      fastapiBaseUrl: import.meta.env.VITE_FASTAPI_BASE_URL,
      appwriteAccount: new Account(new Client().setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT).setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID))
    };
  }
}

// Export the configuration object directly for easy import
export const config = getConfig();

