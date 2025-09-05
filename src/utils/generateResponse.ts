export type ApiEnvelope<T> = {
  status: boolean;        
  message: string;         
  data: T | null;          
};

export const generateResponse = <T>(
  status: boolean,
  data: T | null,
  message: string
): ApiEnvelope<T> => ({
  status,
  message,
  data,
});
