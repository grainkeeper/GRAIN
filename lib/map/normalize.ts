/**
 * PSGC Feature Normalizer – Documentation Stub (for PRD tasks 1.3)
 *
 * Source dataset (merged): `public/geo/2023/provdists-medres.geojson`
 *
 * Verified attributes in the merged ADM2 layer (87 features):
 * - `adm2_psgc`  → Province/District PSGC code (ADM2 level)
 * - `adm1_psgc`  → Region PSGC code (ADM1 level)
 * - No canonical name field was present after dissolve/merge.
 *
 * Display name strategy (current plan):
 * - Use DB overlay `name` when available (admin-managed).
 * - Fallback display text can be the PSGC code (`adm2_psgc`) until overlays are filled.
 *
 * Future-proofing (other known keys from 2023 repo variants):
 * - Names may appear as: `PROVDIST_NAME`, `ADM2_EN`, `PROVINCE_NAME`, `NAME`
 * - Codes may appear as: `PROVDIST_PSGC`, `ADM2_PSGC`, `PROVINCE_PSGC`, `ADM2_PCODE`, `PROV_CODE`
 *
 * Note:
 * - A functional normalizer will be added in a later task (6.x) to auto-detect
 *   these keys and map them to `{ code, name, level=2, parent }`.
 */


