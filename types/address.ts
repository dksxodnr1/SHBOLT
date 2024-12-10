export interface AddressData {
  roadAddress: string;    // 전체 도로명 주소
  jibunAddress: string;   // 지번 주소
  sido: string;          // 시/도
  sigungu: string;       // 시/군/구
  dong: string;          // 동
  zonecode: string;      // 우편번호
  buildingName?: string; // 건물명
}

export interface KakaoAddressData {
  address: string;
  addressType: string;
  bname: string;
  buildingName: string;
  roadAddress: string;
  jibunAddress: string;
  sido: string;
  sigungu: string;
  sigunguCode: string;
  zonecode: string;
  query: string;
}

export interface AddressInfo {
  roadAddress: string;    // 전체 도로명 주소
  jibunAddress: string;   // 지번 주소
  detailAddress: string;  // 상세 주소
  name: string;          // 이름
  contact: string;       // 연락처
  sido: string;         // 시/도
  sigungu: string;      // 시/군/구
  dong: string;         // 동
  fullAddress: string;  // 전체 주소 (도로명 + 상세주소)
  zonecode: string;     // 우편번호
}

