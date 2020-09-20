export type AppErrorType =
  | "validation-error"
  | "auth-error"
  | "system-error"
  | "unverified-error";

export interface AppError {
  type: AppErrorType;
  message: string;
  inputErrors?: InputError[];
}

export interface InputError {
  inputName: string;
  messages: Record<string, string>[];
}
