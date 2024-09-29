interface ImportMetaEnv {
    readonly VITE_BACKEND_API_URL: string;
    readonly VITE_ENABLE_API_MOCKING?: string;
    readonly VITE_APP_URL?: string;
    readonly VITE_APP_MOCK_API_PORT?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
