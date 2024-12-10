import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { Loader2, X } from 'lucide-react'
import { AddressData, KakaoAddressData } from '@/types/address'

interface AddressFormats {
  display: {
    roadAddress: string;
    detailAddress: string;
  };
  submit: {
    sido: string;
    sigungu: string;
    dong: string;
    jibunAddress: string;
  };
}

declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: KakaoAddressData) => void;
        width: string;
        height: string;
        animation: boolean;
        autoMapping?: boolean;
      }) => {
        embed: (element: HTMLElement | string, options?: { 
          autoClose: boolean;
          onResize: (size: { width: number; height: number }) => void;
        }) => void;
      };
    };
  }
}


interface KakaoAddressSearchProps {
  onAddressSelect: (addressData: AddressData, detailAddress: string, addressFormats: AddressFormats) => void;
  initialAddress?: string;
  initialDetailAddress?: string;
  onAddressChange: (addressData: AddressData, detailAddress: string, addressFormats: AddressFormats) => void;
}

export default function KakaoAddressSearch({ 
  onAddressSelect, 
  initialAddress = '', 
  initialDetailAddress = '',
  onAddressChange
}: KakaoAddressSearchProps) {
  const [address, setAddress] = useState(initialAddress);
  const [detailAddress, setDetailAddress] = useState(initialDetailAddress);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.daum?.Postcode) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      setIsLoading(false);
    };
    script.onerror = () => {
      toast.error('주소 검색 서비스를 불러오는데 실패했습니다.');
      setIsLoading(false);
      setIsScriptLoaded(false);
    };
    
    setIsLoading(true);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleAddressSearch = () => {
    if (!isScriptLoaded) {
      toast.error('주소 검색 서비스가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen && isScriptLoaded) {
      const postcode = new window.daum.Postcode({
        oncomplete: function(data: KakaoAddressData) {
          const { roadAddress, jibunAddress, sido, sigungu, bname, zonecode } = data;
          const dong = bname;
          
          // 도로명 주소 저장 (UI 표시용)
          setAddress(roadAddress);
          
          // 콘솔에 받은 데이터 출력
          console.log('Raw Kakao data:', data);
          
          const fullAddress = `${jibunAddress} ${detailAddress}`.trim();
          
          // 두 가지 주소 형식 저장
          const addressFormats: AddressFormats = {
            display: {
              roadAddress: roadAddress,
              detailAddress: detailAddress
            },
            submit: {
              sido: sido,
              sigungu: sigungu,
              dong: dong,
              jibunAddress: fullAddress
            }
          };
          
          // 주소 데이터 구성
          const addressData: AddressData = {
            roadAddress: roadAddress,
            jibunAddress: fullAddress,
            sido,
            sigungu,
            dong,
            zonecode
          };
          
          console.log('Processed Address Data:', addressData);
          console.log('Processed Address Formats:', addressFormats);
          
          onAddressSelect(addressData, detailAddress, addressFormats);
          onAddressChange(addressData, detailAddress, addressFormats);
          setIsModalOpen(false);
        },
        width: '100%',
        height: '100%',
        animation: true,
        autoMapping: true
      });

      const modalContent = document.getElementById('kakao-address-search-modal');
      if (modalContent) {
        postcode.embed(modalContent, {
          autoClose: false,
          onResize: (size) => {
            modalContent.style.height = size.height + 'px';
          },
        });
      }
    }
  }, [isModalOpen, isScriptLoaded, onAddressSelect, detailAddress, onAddressChange]);

  const handleDetailAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDetailAddress = e.target.value;
    setDetailAddress(newDetailAddress);
    
    const currentJibunAddress = address || '';
    const fullAddress = `${currentJibunAddress} ${newDetailAddress}`.trim();
    
    onAddressChange({
      roadAddress: address,
      jibunAddress: fullAddress,
      sido: address ? address.split(' ')[0] : '',
      sigungu: address ? address.split(' ')[1] : '',
      dong: address ? address.split(' ').slice(2).join(' ') : '',
      zonecode: ''
    }, newDetailAddress, {
      display: {
        roadAddress: address,
        detailAddress: newDetailAddress
      },
      submit: {
        sido: address ? address.split(' ')[0] : '',
        sigungu: address ? address.split(' ')[1] : '',
        dong: address ? address.split(' ').slice(2).join(' ') : '',
        jibunAddress: fullAddress
      }
    });
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <Input
          type="text"
          value={address}
          readOnly
          placeholder="주소"
          className="flex-grow border-[#FF925C] border-[1.5px] focus-visible:ring-[#FF925C] focus-visible:ring-[2px] focus:outline-none"
        />
        <Button
          type="button"
          onClick={handleAddressSearch}
          disabled={isLoading || !isScriptLoaded}
          className="bg-[#FF9776] hover:bg-[#FF8561] text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              로딩중
            </>
          ) : (
            '주소 검색'
          )}
        </Button>
      </div>
      <Input
        type="text"
        value={detailAddress}
        onChange={handleDetailAddressChange}
        placeholder="상세주소 (예: 1층 또는 1101호)"
        className="w-full border-[#FF925C] border-[1.5px] focus-visible:ring-[#FF925C] focus-visible:ring-[2px] focus:outline-none"
      />
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg relative h-[90vh] max-h-[600px]">
            <button
              onClick={handleCloseModal}
              className="absolute right-2 top-2 bg-white rounded-full p-2 text-gray-500 hover:text-gray-700 z-[9999] shadow-md"
              aria-label="Close modal"
            >
              <X size={28} />
            </button>
            <div id="kakao-address-search-modal" className="w-full h-full"></div>
          </div>
        </div>
      )}
    </div>
  );
}

