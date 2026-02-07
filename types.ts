
export interface WasteAnalysisRequest {
  description: string;
  quantity: number;
  hazard: string;
  location: string;
}

export interface WasteAnalysisResponse {
  category: string;
  buyer: string;
  revenue: number;
  savings: number;
  co2: number;
  landfill: number;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  category: string;
  quantity: string;
  location: string;
  price: string;
  image: string;
}
