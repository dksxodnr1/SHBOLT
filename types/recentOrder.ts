export type DeliveryOption = '급송' | '일반' | '예약';
export type RouteOption = '편도' | '왕복' | '경유';
export type VehicleOption = '오토바이' | '다마스';
export type BoxSize = '소박스' | '중박스' | '대박스';

export interface AddressInfo {
  name: string;
  contact: string;
  address: string;
  detailAddress: string;
  fullAddress: string;
}

export interface RecentOrder {
  id: string;
  createdAt: string;
  senderInfo: {
    name: string;
    contact: string;
    address: string;
    detailAddress: string;
    fullAddress: string;
    zonecode: string;  // 추가
  };
  receiverInfo: {
    name: string;
    contact: string;
    address: string;
    detailAddress: string;
    fullAddress: string;
    zonecode: string;  // 추가
  };
  boxSize: BoxSize;
  deliveryOption: DeliveryOption;
  productCode?: string;
  orderNumber?: string;
}

