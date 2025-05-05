
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T | null;
  }
  
  export const successResponse = <T>(message: string, data?: T): ApiResponse<T> => {
    return {
      success: true,
      message,
      data: data ?? null,
    };
  };
  
  export const errorResponse = (message: string): ApiResponse<null> => {
    return {
      success: false,
      message,
      data: null,
    };
  };
  