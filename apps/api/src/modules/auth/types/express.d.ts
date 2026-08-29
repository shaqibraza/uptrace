declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
            };

            telemetry?: {
                projectId: string;
                apiKeyId: string;
            };
        }
    }
}

export { };