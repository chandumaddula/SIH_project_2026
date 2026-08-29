import { AxiosError } from 'axios';

/**
 * Standardized Upload Error Formatter
 * Translates HTTP status codes, network faults, and validation exceptions
 * into clean, user-friendly error messages. Never displays raw Python tracebacks or stack traces.
 */
export function parseUploadError(error: unknown): string {
  if (!error) {
    return '❌ Something went wrong while creating the scan.';
  }

  const axiosError = error as AxiosError<{ detail?: string | { msg: string }[] }>;

  // 1. Network Failure / Connection Error
  if (
    axiosError.isAxiosError &&
    (axiosError.code === 'ERR_NETWORK' ||
      axiosError.code === 'ECONNABORTED' ||
      !axiosError.response)
  ) {
    return '❌ Unable to connect to server. Please try again.';
  }

  if (axiosError.response) {
    const status = axiosError.response.status;
    const detail = axiosError.response.data?.detail;

    let detailStr = '';
    if (typeof detail === 'string') {
      detailStr = detail.toLowerCase();
    } else if (Array.isArray(detail)) {
      detailStr = detail.map((d) => d.msg).join(' ').toLowerCase();
    }

    // 2. Client-side Upload Validation Errors (400 Bad Request)
    if (status === 400) {
      if (
        detailStr.includes('extension') ||
        detailStr.includes('mime') ||
        detailStr.includes('format') ||
        detailStr.includes('binary') ||
        detailStr.includes('unsupported')
      ) {
        return '❌ Unsupported image format. Please upload JPG, PNG or WEBP.';
      }

      if (
        detailStr.includes('size') ||
        detailStr.includes('exceeds') ||
        detailStr.includes('10 mb') ||
        detailStr.includes('large')
      ) {
        return '❌ Image is too large. Maximum allowed size is 10 MB.';
      }

      if (detailStr.includes('resolution') || detailStr.includes('low') || detailStr.includes('300')) {
        return '❌ Image resolution is too low. Minimum 300×300 px required for label OCR.';
      }

      return '❌ Unsupported image format. Please upload JPG, PNG or WEBP.';
    }

    // 3. Server Errors (500, 502, 503, etc.)
    if (status >= 500) {
      return '❌ Something went wrong while creating the scan.';
    }
  }

  // 4. Fallback string matching for general errors
  const msg = typeof error === 'string' ? error.toLowerCase() : String((error as Error)?.message || error).toLowerCase();

  if (msg.includes('network') || msg.includes('failed to fetch') || msg.includes('connect')) {
    return '❌ Unable to connect to server. Please try again.';
  }

  if (msg.includes('size') || msg.includes('10 mb') || msg.includes('large') || msg.includes('exceeds')) {
    return '❌ Image is too large. Maximum allowed size is 10 MB.';
  }

  if (msg.includes('format') || msg.includes('extension') || msg.includes('unsupported') || msg.includes('type')) {
    return '❌ Unsupported image format. Please upload JPG, PNG or WEBP.';
  }

  return '❌ Something went wrong while creating the scan.';
}
