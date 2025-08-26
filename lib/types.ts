export interface Scenario {
  id: number;
  type: 'pre-foreclosure' | 'relocation' | 'stuck-listing' | 'low-equity' | 'high-equity';
  title: string;
  property: {
    address: string;
    fmv: number;
    owedAmount: number;
    monthlyPayment: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    yearBuilt: number;
    condition: 'excellent' | 'cosmetic-repair';
    conditionDetails: string;
    propertyTaxes: number;
    repairCosts: number;
    repairCategory: 'minor' | 'major';
    repairDetails: string;
    rentalIncome: number;
  };
  seller: {
    name: string;
    age: number;
    situation: string;
    motivation: string;
    timeframe: string;
    flexibility: 'high' | 'medium' | 'low';
    additionalAssets?: string[];
  };
  financials: {
    equity: number;
    ltv: number;
    loanType: 'conventional' | 'fha' | 'va' | 'other';
    arrearsAmount?: number;
    arrearsMonths?: number;
    taxArrears?: number;
    monthsOnMarket?: number;
    carryingCosts?: number;
    taxesOwed?: number;
  };
}
