# Legal Metrology Commodity Label Dataset

This repository folder contains the annotated image dataset used for training, evaluating, and testing the AI/OCR Legal Metrology Label Parsing Engine under the Legal Metrology (Packaged Commodities) Rules, 2011 (PCR 2011).

---

## 📁 Directory Structure

```
dataset/
│
├── images/
│   ├── raw/          # Unprocessed raw package camera captures
│   ├── processed/    # Deskewed, contrast-enhanced & cropped images
│   └── test/         # Benchmark test images for OCR & rule verification
│
├── annotations/      # Bounding box JSON & Pascal VOC / COCO annotation files
│
├── metadata/         # Product catalog metadata (CSV / JSON mapping)
│
└── README.md         # Dataset documentation & guidelines
```

---

## 🏷️ Annotation Guidelines & Classes

Each image annotation labels mandatory declarations specified in **Rule 6 of PCR 2011**:

| Class Name | Description | Mandatory Legal Rule |
| :--- | :--- | :--- |
| `mrp_declaration` | Maximum Retail Price statement including tax clause | PCR 2011 Rule 6(1)(e) |
| `net_quantity` | Net weight, volume, or count of the commodity | PCR 2011 Rule 6(1)(c) |
| `mfg_date` | Date of manufacture, packing, or import | PCR 2011 Rule 6(1)(d) |
| `manufacturer_info` | Name and complete address of manufacturer/packer | PCR 2011 Rule 6(1)(a) |
| `consumer_helpline` | Customer care email, phone number, or helpline | PCR 2011 Rule 6(2) |

---

## ⚙️ Dataset Specifications

- **Formats Supported**: `.jpg`, `.jpeg`, `.png`, `.webp`
- **Minimum Resolution**: 300 × 300 px
- **Annotation Format**: JSON Bounding Boxes `[x_percent, y_percent, width_percent, height_percent]`
