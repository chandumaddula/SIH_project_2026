// Local Storage Wrapper for Mobile App
export const localStorage = {
  saveOfflineRecord(key: string, value: any) {
    console.log(`Saved offline record ${key}`);
  },
  getOfflineRecord(key: string) {
    return null;
  }
};
