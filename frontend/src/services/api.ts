const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  public status: number;
  public details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach demo token
  if (!headers.has('Authorization')) {
    headers.set('Authorization', 'Bearer 00000000-0000-0000-0000-000000000001');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const fallbackMessage =
      response.status === 500 || response.status === 502 || response.status === 503
        ? 'Cannot connect to PayPilot backend on port 5000. Please ensure "npm run dev" is running from the project root.'
        : `HTTP ${response.status}: ${response.statusText}`;

    throw new ApiError(
      data.error || fallbackMessage,
      response.status,
      data.details
    );
  }

  return data;
}
