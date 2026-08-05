/**
 * Vendored from wedding-shared-types/src/types/{common,vendor}.ts so this repo
 * builds standalone (Netlify clones it without sibling repos). Keep in sync with
 * the wedding-shared-types package, which remains the source of truth.
 */

export type ID = string;

export type ISODate = string;

export type WeddingTheme =
  | 'traditional_chagga'
  | 'traditional_haya'
  | 'traditional_nyamwezi'
  | 'coastal_swahili'
  | 'islamic_nikah'
  | 'christian_church'
  | 'garden'
  | 'beach_zanzibar'
  | 'safari_bush'
  | 'rooftop_urban'
  | 'destination';

export type VendorCategory =
  | 'photographer'
  | 'caterer'
  | 'decor'
  | 'venue'
  | 'dj_mc'
  | 'cake'
  | 'transport'
  | 'beauty'
  | 'officiant';

/** Onboarding lifecycle of a vendor's public listing. */
export type VendorProfileStatus = 'draft' | 'submitted' | 'live';

export interface Vendor {
  id: ID;
  /** The vendor workspace this listing belongs to. Absent on legacy listings. */
  tenantId?: ID;
  userId: ID;
  slug: string;
  status?: VendorProfileStatus;
  submittedAt?: ISODate;
  businessName: string;
  category: VendorCategory;
  serviceAreas: string[];
  yearsInBusiness?: number;
  verified: boolean;
  highlyRated: boolean;
  fastResponder: boolean;
  themes: WeddingTheme[];
  description: string;
  portfolioImageUrls: string[];
  coverImageUrl?: string;
  packages: VendorPackage[];
  rating?: number;
  reviewCount: number;
  responseRateHours?: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface VendorPackage {
  id: ID;
  name: string;
  description: string;
  priceTzs: number;
  durationHours?: number;
  inclusions: string[];
}
