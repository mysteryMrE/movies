import { Client, Account } from "appwrite";
function getConfig() {
  console.log("🐛 Debug env vars:", window.APP_CONFIG);
  if (window.APP_CONFIG) {
    return {
      appwriteUrl: window.APP_CONFIG.VITE_APPWRITE_ENDPOINT,
      appwriteProjectId: window.APP_CONFIG.VITE_APPWRITE_PROJECT_ID,
      fastapiBaseUrl: window.APP_CONFIG.VITE_FASTAPI_BASE_URL,
      fastapiBaseSocket: window.APP_CONFIG.VITE_FASTAPI_BASE_SOCKET,
      appwriteAccount: new Account(new Client().setEndpoint(window.APP_CONFIG.VITE_APPWRITE_ENDPOINT).setProject(window.APP_CONFIG.VITE_APPWRITE_PROJECT_ID))
    };
  } else {
    return {
      appwriteUrl: import.meta.env.VITE_APPWRITE_ENDPOINT,
      appwriteProjectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
      fastapiBaseUrl: import.meta.env.VITE_FASTAPI_BASE_URL,
      fastapiBaseSocket: import.meta.env.VITE_FASTAPI_BASE_SOCKET,
      appwriteAccount: new Account(new Client().setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT).setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID))
    };
  }
}

export const config = getConfig();

