// AI OCR & Bounding Box Extraction Service
export const aiService = {
  async processLabelImage(imageFile: File | string) {
    // Simulates calling FastAPI backend /api/v1/ocr/extract endpoint
    return {
      success: true,
      extractedFields: [
        { key: 'Product Identity', value: 'Refined Edible Cooking Oil', confidence: 0.97 },
        { key: 'Net Quantity', value: '1 L (Net Weight 910 g)', confidence: 0.95 },
        { key: 'MRP', value: '₹ 185.00 incl. of all taxes', confidence: 0.98 }
      ]
    };
  }
};
