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

    if (error.status === 404) {
      return 'Registro não encontrado.';
    }

    if (error.status === 400 && message) {
      return message;
    }
  }

  return message || fallbackMessage;
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
