// Mobile API Client Service
export const mobileApi = {
  async uploadFieldCapture(formData: any) {
    console.log('Syncing offline mobile inspection payload...');
    return { success: true, serverSessionId: `OFF-SESS-${Date.now()}` };
  }
};
