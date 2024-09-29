import * as z from 'zod';

const createEnv = () => {
    const EnvSchema = z.object({
        BACKEND_API_URL: z.string(),
        ENABLE_API_MOCKING: z
            .string()
            .refine((s) => s === 'true' || s === 'false')
            .transform((s) => s === 'true')
            .optional(),
        APP_URL: z.string().optional().default('http://localhost:3000'),
        APP_MOCK_API_PORT: z.string().optional().default('8080'),
    });

    const envVars = {
        BACKEND_API_URL: import.meta.env.VITE_APP_BACKEND_API_URL,
        ENABLE_API_MOCKING: import.meta.env.VITE_APP_ENABLE_API_MOCKING || 'false',
        APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
        APP_MOCK_API_PORT: import.meta.env.VITE_APP_MOCK_API_PORT || '8080',
    };

    const parsedEnv = EnvSchema.safeParse(envVars);

    if (!parsedEnv.success) {
        throw new Error(
            `Invalid env provided.
The following variables are missing or invalid:
${Object.entries(parsedEnv.error.flatten().fieldErrors)
                .map(([k, v]) => `- ${k}: ${v}`)
                .join('\n')}`,
        );
    }

    return parsedEnv.data;
};

export const env = createEnv();