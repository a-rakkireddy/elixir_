import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * HTTP client for making API requests
 */
class HttpClient {
  /**
   * Make a GET request
   * @param url URL to request
   * @param config Optional Axios config
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await axios.get<T>(url, config);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a POST request
   * @param url URL to request
   * @param data Data to send
   * @param config Optional Axios config
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await axios.post<T>(url, data, config);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handle HTTP errors
   * @param error Error to handle
   */
  private handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

export const httpClient = new HttpClient();
