import { HttpErrorResponse } from '@angular/common/http';

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly message: string;
  readonly data: T | null;
}

export class ApiResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiResponseError';
  }
}

export function unwrapApiData<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (!response.success || response.data === null) {
    throw new ApiResponseError(response.message || fallbackMessage);
  }

  return response.data;
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  const message = extractMessage(error);

  if (message?.toLocaleLowerCase('pt-BR').includes('já existe')) {
    return 'Já existe um registro cadastrado com este nome.';
  }

  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
    }

    if (error.status === 401) {
      return 'Sua sessão expirou. Entre novamente para continuar.';
    }

    if (error.status === 403) {
      return 'Você não tem permissão para realizar esta ação.';
    }

    if (error.status === 404) {
      return 'Registro não encontrado.';
    }

    if (error.status === 400 || error.status === 422) {
      return isSafeUserMessage(message)
        ? message!
        : 'Não foi possível processar os dados. Revise os campos e tente novamente.';
    }

    if (error.status === 409) {
      return isSafeUserMessage(message)
        ? message!
        : 'Não foi possível concluir porque existe um conflito com outro registro.';
    }

    if (error.status >= 500) {
      return 'O serviço está temporariamente indisponível. Tente novamente em alguns instantes.';
    }
  }

  return isSafeUserMessage(message) ? message! : fallbackMessage;
}

function isSafeUserMessage(message: string | null): boolean {
  if (!message) return false;

  const technicalPattern =
    /\b(?:http failure|status\s*(?:code)?\s*[:=]?\s*\d{3}|internal server error|bad request|exception|stack trace)\b|https?:\/\/|localhost|\/api\//i;

  return !technicalPattern.test(message);
}

function extractMessage(error: unknown): string | null {
  if (error instanceof HttpErrorResponse) {
    const responseError = error.error;

    if (responseError && typeof responseError === 'object') {
      if ('message' in responseError && typeof responseError.message === 'string') {
        return responseError.message;
      }

      if ('errors' in responseError) {
        const validationMessage = extractValidationMessage(responseError.errors);

        if (validationMessage) {
          return validationMessage;
        }
      }

      if ('title' in responseError && typeof responseError.title === 'string') {
        return responseError.title;
      }
    }

    return error.message;
  }

  if (error instanceof ApiResponseError || error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = error.message;
    return typeof message === 'string' ? message : null;
  }

  return null;
}

function extractValidationMessage(errors: unknown): string | null {
  if (!errors || typeof errors !== 'object') {
    return null;
  }

  for (const value of Object.values(errors)) {
    if (Array.isArray(value)) {
      const message = value.find((item): item is string => typeof item === 'string');

      if (message) {
        return message;
      }
    }

    if (typeof value === 'string') {
      return value;
    }
  }

  return null;
}
