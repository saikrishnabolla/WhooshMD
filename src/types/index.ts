export interface Provider {
  number: string;
  enumeration_type: string;
  basic: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    name?: string;
    organization_name?: string;
    gender?: string;
    sole_proprietor?: string;
    status: string;
    credential?: string;
    last_updated: string;
  };
  taxonomies: Array<{
    code: string;
    desc: string;
    primary: boolean;
    state?: string;
    license?: string;
  }>;
  addresses: Array<{
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country_code: string;
    telephone_number?: string;
    fax_number?: string;
    address_type: string;
    address_purpose: string;
  }>;
  other_names?: Array<{
    organization_name?: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    credential?: string;
    type?: string;
  }>;
  endpoints?: Array<{
    endpointType: string;
    endpoint: string;
    endpointDescription?: string;
    affiliation?: string;
    use?: string;
    useDescription?: string;
    contentType?: string;
    contentTypeDescription?: string;
    contentOther?: string;
  }>;
}

export interface SearchParams {
  version: string;
  number?: string;
  enumeration_type?: string;
  taxonomy_description?: string;
  first_name?: string;
  last_name?: string;
  organization_name?: string;
  address_purpose?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country_code?: string;
  limit?: number;
  skip?: number;
}

export interface SearchResponse {
  result_count: number;
  results: Provider[];
}

export interface SearchHistoryItem {
  id: string;
  params: SearchParams;
  timestamp: number;
  resultCount: number;
}

export interface FavoriteProvider {
  id: string;
  provider: Provider;
  timestamp: number;
}