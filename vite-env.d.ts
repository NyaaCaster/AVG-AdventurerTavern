/// <reference types="vite/client" />

/**
 * 全局类型声明
 * 
 * 由 Vite define 注入的构建时变量
 */

declare const __FILE_SERVER_API_KEY__: string;
declare const __AVG_DATABASE_API_URL__: string;
declare const __DEBUG_PASSWD__: string;

// NyaaAcount platform public entry (https). Injected by vite.config.ts
// (define) from NYAAACOUNT_PUBLIC_URL — same pipeline as
// __AVG_DATABASE_API_URL__ (.env locally, --build-arg in container builds).
// Public URL only — safe to inline into the bundle.
declare const __NYAACOUNT_PUBLIC_URL__: string;
