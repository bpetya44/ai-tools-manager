import { apiRequestWithAuth } from "./api";

export interface TwoFAStatus {
  enabled: boolean;
  confirmed_at: string | null;
}

export interface TwoFAEnableResponse {
  qr_code_url: string;
  secret_key: string;
  recovery_codes: string[];
}

export interface TwoFAVerifyRequest {
  code: string;
}

export interface TwoFADisableRequest {
  code: string;
}

export interface TwoFARegenerateResponse {
  recovery_codes: string[];
}

/**
 * Get 2FA status for the authenticated user
 */
export const get2FAStatus = (token: string): Promise<TwoFAStatus> => {
  // Use user endpoint as workaround while debugging 2FA routes
  return apiRequestWithAuth<any>("/user", token).then((user) => ({
    enabled: user.two_factor_enabled || false,
    confirmed_at: user.two_factor_confirmed_at || null,
  }));
};

/**
 * Enable 2FA for the authenticated user
 */
export const enable2FA = (token: string): Promise<TwoFAEnableResponse> => {
  return apiRequestWithAuth<TwoFAEnableResponse>("/2fa/enable", token, {
    method: "POST",
  });
};

/**
 * Verify 2FA code
 */
export const verify2FA = (token: string, code: string): Promise<void> => {
  return apiRequestWithAuth<void>("/2fa/verify", token, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
};

/**
 * Disable 2FA for the authenticated user
 */
export const disable2FA = (token: string, code: string): Promise<void> => {
  return apiRequestWithAuth<void>("/2fa/disable", token, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
};

/**
 * Regenerate recovery codes
 */
export const regenerateRecoveryCodes = (
  token: string
): Promise<TwoFARegenerateResponse> => {
  return apiRequestWithAuth<TwoFARegenerateResponse>(
    "/2fa/regenerate-recovery-codes",
    token,
    {
      method: "POST",
    }
  );
};
