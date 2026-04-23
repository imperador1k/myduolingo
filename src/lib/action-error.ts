export const ActionErrorCodes = {
    UNAUTHORIZED: "UNAUTHORIZED",
    RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
    INVALID_PAYLOAD: "INVALID_PAYLOAD",
    SPOOFING_DETECTED: "SPOOFING_DETECTED",
    INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
    NOT_FOUND: "NOT_FOUND",
    CONFLICT: "CONFLICT",
    BAD_REQUEST: "BAD_REQUEST",
    SERVER_ERROR: "SERVER_ERROR",
} as const;

export type ErrorCode = keyof typeof ActionErrorCodes;

export type StandardActionError = {
    success: false;
    code: ErrorCode;
    message: string;
};

/**
 * Função utilitária para criar um erro padronizado para as Server Actions.
 * Garante que o retorno é sempre do tipo StandardActionError e previsível para o frontend.
 */
export function actionError(code: ErrorCode, message: string): StandardActionError {
    return { success: false, code, message };
}
