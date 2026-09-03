# Legal Metrology Rule Mapping Matrix

| Rule ID | Rule Reference | Target Field | Requirement Type | Validation Method | Severity | Effective Date | Active |
|---|---|---|---|---|---|---|---|
| `PC-001` | Rule 6(1)(a) | `manufacturer` / `packer` | presence | `check_manufacturer_presence` | `HIGH` | 2011-03-01 | `true` |
| `PC-002` | Rule 6(1)(a) | `address` | completeness | `check_address_details` | `MEDIUM` | 2011-03-01 | `true` |
| `PC-003` | Rule 6(1)(a) | `country_of_origin` | presence_on_import | `check_country_of_origin` | `HIGH` | 2021-04-01 | `true` |
| `PC-004` | Rule 6(1)(b) | `generic_name` | presence | `check_generic_name_presence` | `MEDIUM` | 2011-03-01 | `true` |
| `PC-005` | Rule 6(1)(f) | `consumer_care` | presence_and_format | `check_consumer_care_details` | `HIGH` | 2011-03-01 | `true` |
| `MRP-001` | Rule 6(1)(e) | `mrp` | presence | `check_mrp_presence` | `CRITICAL` | 2011-03-01 | `true` |
| `MRP-002` | Rule 6(1)(e) | `mrp` | format_and_taxes | `check_mrp_format` | `HIGH` | 2011-03-01 | `true` |
| `MRP-003` | Rule 6(1)(11) | `unit_sale_price` | presence_and_calculation | `check_unit_sale_price` | `MEDIUM` | 2022-01-01 | `true` |
| `MRP-004` | Rule 18(2A) | `mrp` | dual_pricing_prohibition | `check_dual_pricing` | `CRITICAL` | 2017-06-23 | `true` |
| `QTY-001` | Rule 6(1)(c) | `net_quantity` | presence | `check_quantity_presence` | `CRITICAL` | 2011-03-01 | `true` |
| `QTY-002` | Rule 6(1)(c) | `net_quantity` | standard_unit_symbol | `check_standard_units` | `HIGH` | 2011-03-01 | `true` |
| `QTY-003` | Schedule II | `net_quantity` | symbol_size_ratio | `check_quantity_symbol_size` | `MEDIUM` | 2011-03-01 | `true` |
| `DATE-001` | Rule 6(1)(d) | `mfg_date` / `pkg_date` | presence | `check_date_presence` | `HIGH` | 2011-03-01 | `true` |
| `DATE-002` | Rule 6(1)(d) | `mfg_date` | format | `check_date_format` | `MEDIUM` | 2011-03-01 | `true` |
| `DATE-003` | Rule 6(1)(d) | `exp_date` | consistency | `check_date_validity` | `HIGH` | 2011-03-01 | `true` |
| `FONT-001` | Rule 9(1) | `font_height` | min_height_by_pdp | `check_font_height` | `MEDIUM` | 2011-03-01 | `true` |
| `PLACE-001` | Rule 8 | `pdp_placement` | pdp_visibility | `check_pdp_placement` | `MEDIUM` | 2011-03-01 | `true` |
| `EXM-001` | Rule 26(a) | `package_weight` | small_package_exemption | `check_small_pack_exemption` | `N/A` | 2011-03-01 | `true` |
| `EXM-002` | Rule 3 | `consumer_type` | institutional_exemption | `check_institutional_exemption` | `N/A` | 2011-03-01 | `true` |
