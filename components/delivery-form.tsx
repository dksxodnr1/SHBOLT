'use client'

import { useState, ChangeEvent, FormEvent, useEffect } from "react"
import { ArrowLeftRight, MessageCircle, Clock, ClipboardList } from 'lucide-react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/app/AuthContext'
import { useRouter } from 'next/navigation'
import { AnimatedLogo } from './AnimatedLogo'
import { toast } from 'sonner'
import { getOAuthToken } from '@/app/api/auth'
import KakaoAddressSearch from './KakaoAddressSearch'
import { RecentOrderHistory } from './RecentOrderHistory'
import { AddressInfo } from '../types/address'
import { RecentOrder, DeliveryOption, RouteOption, VehicleOption, BoxSize } from '../types/recentOrder'
import { UserInfo } from './UserInfo'
import Link from 'next/link'

interface AddressData {
  roadAddress: string;
  jibunAddress: string;
  sido: string;
  sigungu: string;
  dong: string;
  zonecode: string;
}

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

const MotionCard = motion(Card)
const MotionInput = motion(Input)

const ButtonWrapper = ({ 
  children, 
  isSelected, 
  onSelect, 
  ...props 
}: { 
  children: React.ReactNode, 
  isSelected: boolean,
  onSelect: () => void 
  [key: string]: any 
}) => {
  return (
    <button
      type="button"
      {...props}
      className={`border border-[#FF9776] rounded-md px-4 py-2 ${
        isSelected ? 'bg-[#FF9776] text-white' : 'bg-white text-[#FF9776]'
      } font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50 ${props.className || ''}`}
      onClick={(e) => {
        e.preventDefault();
        onSelect();
      }}
    >
      {children}
    </button>
  );
};

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
}

export default function DeliveryForm() {
  const [senderInfo, setSenderInfo] = useState<AddressInfo>({
    roadAddress: "",
    jibunAddress: "",
    detailAddress: "",
    name: "",
    contact: "",
    sido: "",
    sigungu: "",
    dong: "",
    fullAddress: "",
    zonecode: ""
  })

  const [receiverInfo, setReceiverInfo] = useState<AddressInfo>({
    roadAddress: "",
    jibunAddress: "",
    detailAddress: "",
    name: "",
    contact: "",
    sido: "",
    sigungu: "",
    dong: "",
    fullAddress: "",
    zonecode: ""
  })

  const [selectedBoxSize, setSelectedBoxSize] = useState<BoxSize | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption | null>(null);
  const [productCode, setProductCode] = useState("");
  const [isProductCodeNone, setIsProductCodeNone] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isOrderNumberNone, setIsOrderNumberNone] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [isTicketNumberNone, setIsTicketNumberNone] = useState(false);
  const [register, setRegister] = useState("");
  const [isRegisterNone, setIsRegisterNone] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [selectedOption, setSelectedOption] = useState<DeliveryOption | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [year, setYear] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const [hour, setHour] = useState<string>("");
  const [minute, setMinute] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [requestDetails, setRequestDetails] = useState("");
  const [orderComplete, setOrderComplete] = useState<{
    isComplete: boolean;
    serialNumber: string;
    details: any;
  } | null>(null);
  const [showRecentOrders, setShowRecentOrders] = useState(false);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const [senderAddressFormats, setSenderAddressFormats] = useState<AddressFormats>({
    display: { roadAddress: "", detailAddress: "" },
    submit: { sido: "", sigungu: "", dong: "", jibunAddress: "" }
  });

  const [receiverAddressFormats, setReceiverAddressFormats] = useState<AddressFormats>({
    display: { roadAddress: "", detailAddress: "" },
    submit: { sido: "", sigungu: "", dong: "", jibunAddress: "" }
  });

  const router = useRouter();
  const { isLoggedIn, userId } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleSwap = () => {
    setSenderInfo({ ...receiverInfo });
    setReceiverInfo({ ...senderInfo });
    setSenderAddressFormats({...receiverAddressFormats});
    setReceiverAddressFormats({...senderAddressFormats});
  };

  const handleAddressChange = (type: 'sender' | 'receiver') => (
    addressData: AddressData, 
    detailAddress: string,
    addressFormats: AddressFormats
  ) => {
    console.log(`${type} address data:`, addressData);
    if (type === 'sender') {
      setSenderInfo((prev: AddressInfo) => ({
        ...prev,
        ...addressData,
        detailAddress,
      }));
      setSenderAddressFormats(addressFormats);
    } else {
      setReceiverInfo((prev: AddressInfo) => ({
        ...prev,
        ...addressData,
        detailAddress,
      }));
      setReceiverAddressFormats(addressFormats);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('접수하기 버튼이 클릭되었습니다.');
    if (!isLoggedIn) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!senderInfo.sido || !senderInfo.sigungu || !senderInfo.dong ||
        !receiverInfo.sido || !receiverInfo.sigungu || !receiverInfo.dong) {
      toast.error('주소 정보가 완전하지 않습니다. 주소 검색을 다시 해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // Retrieve a new token when submitting the order
      const token = await getOAuthToken();
      if (!token) {
        throw new Error('토큰을 받아오는데 실패했습니다.');
      }

      console.log('Sender dong:', senderInfo.dong);
      console.log('Receiver dong:', receiverInfo.dong);

      const requestBody: any = {
        m_code: '1119',
        cc_code: '2076',
        user_id: userId,
        token, // Use the newly retrieved token
        c_name: senderInfo.name,
        c_mobile: senderInfo.contact.replace(/-/g, ''),
        s_start: senderInfo.name,
        start_telno: senderInfo.contact.replace(/-/g, ''),
        start_sido: senderAddressFormats.submit.sido,
        start_gugun: senderAddressFormats.submit.sigungu,
        start_dong: senderAddressFormats.submit.dong,
        start_location: senderAddressFormats.submit.jibunAddress,
        s_dest: receiverInfo.name,
        dest_telno: receiverInfo.contact.replace(/-/g, ''),
        dest_sido: receiverAddressFormats.submit.sido,
        dest_gugun: receiverAddressFormats.submit.sigungu,
        dest_dong: receiverAddressFormats.submit.dong,
        dest_location: receiverAddressFormats.submit.jibunAddress,
        dset: receiverInfo.detailAddress,
        kind: selectedVehicle === '오토바이' ? '1' : '2',
        pay_gbn: '1',
        doc: selectedRoute === '편도' ? '1' : selectedRoute === '왕복' ? '3' : '5',
        sfast: selectedOption === '급송' ? '3' : '1',
        item_type: selectedBoxSize === '소박스' ? '2' : selectedBoxSize === '중박스' ? '3' : '4',
        use_check: selectedOption === '예약' ? '3' : '',
        pickup_date: selectedOption === '예약' ? `${year}-${month}-${day}` : '',
        pick_hour: selectedOption === '예약' ? hour : '',
        pick_min: selectedOption === '예약' ? minute : '',
        memo: `${requestDetails}${productCode ? ` 제품 코드: ${productCode}` : ''}`,
        dept_name: orderNumber || '',
        dest_dept: `${ticketNumber ? `티켓 번호: ${ticketNumber}` : ''}${register ? ` 레지스터: ${register}` : ''}`.trim(),
      };

      console.log('주문 등록 요청:', requestBody);
      console.log('요청사항:', requestBody.memo);
      console.log('오더 번호 (dept_name):', requestBody.dept_name);
      console.log('티켓 번호 및 레지스터 (dest_dept):', requestBody.dest_dept);

      const response = await fetch('/api/order_regist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('API 응답 전체:', data);

      const resultCode = data.code;
      const resultMsg = data.msg;
      const serialNumber = data.savedData.apiResponse.Result.serial_number || '알수 없음';

      console.log('응답 코드:', resultCode);
      console.log('응답 메시지:', resultMsg);
      console.log('시리얼 넘버:', serialNumber);

      if (resultCode === 1000) {
        setOrderComplete({
          isComplete: true,
          serialNumber: serialNumber,
          details: {
            senderInfo: senderInfo,
            receiverInfo: receiverInfo,
            boxSize: selectedBoxSize,
            deliveryOption: selectedOption,
            route: selectedRoute,
            vehicle: selectedVehicle,
            requestDetails: requestDetails,
            productCode: productCode,
            orderNumber: orderNumber,
            ticketNumber: ticketNumber,
            register: register
          }
        });
        toast.success('오더가 성공적으로 등록되었습니다.');
        console.log('주문 번호:', serialNumber);
      } else {
        throw new Error(resultMsg || '오더 등록에 실패했습니다.');
      }

    } catch (error) {
      console.error('주문 등록 오류:', error);
      toast.error(error instanceof Error ? error.message : '오더 등록 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowRecentOrders = async () => {
    try {
      const response = await fetch(`/api/recent-orders?userId=${userId}`);
      if (!response.ok) {
        throw new Error('최근 주문을 가져오는데 실패했습니다.');
      }
      const data = await response.json();
      setRecentOrders(data);
      setShowRecentOrders(true);
    } catch (error) {
      console.error('최근 주문 조회 오류:', error);
      toast.error('최근 주문을 불러오는데 실패했습니다.');
    }
  };

  const handleSelectRecentOrder = (order: RecentOrder) => {
    setSenderInfo({
      name: order.senderInfo.name,
      contact: order.senderInfo.contact,
      roadAddress: order.senderInfo.address,
      detailAddress: order.senderInfo.detailAddress || '',
      sido: order.senderInfo.address.split(' ')[0] || '',
      sigungu: order.senderInfo.address.split(' ')[1] || '',
      dong: order.senderInfo.address.split(' ').slice(2).join(' '),
      jibunAddress: '',
      fullAddress: order.senderInfo.fullAddress,
      zonecode: order.senderInfo.zonecode || ''
    });
    setSenderAddressFormats({
      display: {
        roadAddress: order.senderInfo.address,
        detailAddress: order.senderInfo.detailAddress,
      },
      submit: {
        sido: order.senderInfo.address.split(' ')[0],
        sigungu: order.senderInfo.address.split(' ')[1],
        dong: order.senderInfo.address.split(' ').slice(2).join(' '),
        jibunAddress: order.senderInfo.fullAddress
      }
    });
    setReceiverInfo({
      name: order.receiverInfo.name,
      contact: order.receiverInfo.contact,
      roadAddress: order.receiverInfo.address,
      detailAddress: order.receiverInfo.detailAddress || '',
      sido: order.receiverInfo.address.split(' ')[0] || '',
      sigungu: order.receiverInfo.address.split(' ')[1] || '',
      dong: order.receiverInfo.address.split(' ').slice(2).join(' '),
      jibunAddress: '',
      fullAddress: order.receiverInfo.fullAddress,
      zonecode: order.receiverInfo.zonecode || ''
    });
    setReceiverAddressFormats({
      display: {
        roadAddress: order.receiverInfo.address,
        detailAddress: order.receiverInfo.detailAddress,
      },
      submit: {
        sido: order.receiverInfo.address.split(' ')[0],
        sigungu: order.receiverInfo.address.split(' ')[1],
        dong: order.receiverInfo.address.split(' ').slice(2).join(' '),
        jibunAddress: order.receiverInfo.fullAddress
      }
    });
    setSelectedBoxSize(order.boxSize);
    setSelectedOption(order.deliveryOption);
    setShowRecentOrders(false);
  };

  if (orderComplete?.isComplete) {
    return (
      <div className="min-h-screen bg-[#FFF5F2] flex items-center justify-center p-4">
        <MotionCard 
          className="p-6 rounded-lg shadow-[0_4px_18.8px_3px_rgba(255,146,92,0.3)] bg-white border-none w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#FF9776] mb-4">접수 완료</h2>
            <div className="bg-[#FFF5F2] rounded-lg p-4 mb-6">
              <p className="text-lg mb-2">접수오더번호:</p>
              <p className="text-2xl font-bold text-[#FF9776]">{orderComplete.serialNumber}</p>
            </div>
            <div className="text-left mb-6">
              <h3 className="text-xl font-semibold mb-4">접수 상세 내용</h3>
              <div className="space-y-2">
                <p><strong>보내는 분:</strong> {orderComplete.details.senderInfo.name}</p>
                <p><strong>출발지:</strong> {orderComplete.details.senderInfo.roadAddress}</p>
                <p><strong>받는 분:</strong> {orderComplete.details.receiverInfo.name}</p>
                <p><strong>도착지:</strong> {orderComplete.details.receiverInfo.roadAddress}</p>
                <p><strong>물품 종류:</strong> {orderComplete.details.boxSize}</p>
                <p><strong>배송 옵션:</strong> {orderComplete.details.deliveryOption}</p>
                <p><strong>배송 경로:</strong> {orderComplete.details.route}</p>
                <p><strong>배송 수단:</strong> {orderComplete.details.vehicle}</p>
                {orderComplete.details.productCode && (
                  <p><strong>제품 코드:</strong> {orderComplete.details.productCode}</p>
                )}
                {orderComplete.details.orderNumber && (
                  <p><strong>오더 번호:</strong> {orderComplete.details.orderNumber}</p>
                )}
                {orderComplete.details.ticketNumber && (
                  <p><strong>티켓 번호:</strong> {orderComplete.details.ticketNumber}</p>
                )}
                {orderComplete.details.register && (
                  <p><strong>레지스터:</strong> {orderComplete.details.register}</p>
                )}
              </div>
            </div>
            <p className="text-gray-600 mb-8">배송현황은 카카오톡 채널로 문의 부탁드립니다.</p>
            <Button 
              className="w-full bg-[#FF9776] hover:bg-[#FF8561] text-white"
              onClick={() => {
                setOrderComplete(null);
                setSenderInfo({
                  roadAddress: "",
                  jibunAddress: "",
                  detailAddress: "",
                  name: "",
                  contact: "",
                  sido: "",
                  sigungu: "",
                  dong: "",
                  fullAddress: "",
                  zonecode: ""
                });
                setReceiverInfo({
                  roadAddress: "",
                  jibunAddress: "",
                  detailAddress: "",
                  name: "",
                  contact: "",
                  sido: "",
                  sigungu: "",
                  dong: "",
                  fullAddress: "",
                  zonecode: ""
                });
                setSelectedBoxSize(null);
                setSelectedVehicle(null);
                setSelectedRoute(null);
                setSelectedOption(null);
                setRequestDetails("");
                setProductCode("");
                setOrderNumber("");
                setTicketNumber("");
                setRegister("");
                setIsProductCodeNone(false);
                setIsOrderNumberNone(false);
                setIsTicketNumberNone(false);
                setIsRegisterNone(false);
                setSenderAddressFormats({
                  display: { roadAddress: "", detailAddress: "" },
                  submit: { sido: "", sigungu: "", dong: "", jibunAddress: "" }
                });
                setReceiverAddressFormats({
                  display: { roadAddress: "", detailAddress: "" },
                  submit: { sido: "", sigungu: "", dong: "", jibunAddress: "" }
                });
              }}
            >
              새 주문하기
            </Button>
          </div>
        </MotionCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F2] p-4 md:p-6 lg:p-8">
      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="mb-8 flex justify-between items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <AnimatedLogo width={isMobile ? 100 : 150} height={isMobile ? 60 : 90} />
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link href="/order-list" passHref>
                <Button variant="outline" size={isMobile ? "sm" : "default"} className="flex items-center space-x-1 md:space-x-2">
                  <ClipboardList className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                  <span className={isMobile ? "text-xs" : "text-sm"}>주문 목록</span>
                </Button>
              </Link>
              <UserInfo />
            </div>
          </motion.div>

          <MotionCard
            className="p-4 md:p-6 mb-6 rounded-lg shadow-[0_4px_18.8px_3px_rgba(255,146,92,0.3)] bg-white border-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              <div className="space-y-4 md:col-span-1">
                <h2 className="text-base md:text-lg font-semibold text-[#FF9776]">접수자 정보</h2>
                <div className="grid grid-cols-1 gap-4">
                  <MotionInput
                    placeholder="접수자 성함" 
                    className="w-full border-[#FF9776] border-[1.5px] rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50 placeholder:text-gray-400 placeholder:font-light"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <MotionInput
                    placeholder="접수자 연락처" 
                    className="w-full border-[#FF9776] border-[1.5px] rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50 placeholder:text-gray-400 placeholder:font-light"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <Button
                    type="button"
                    onClick={handleShowRecentOrders}
                    className="w-full bg-[#FF9776] hover:bg-[#FF8561] text-white text-sm md:text-base py-2 md:py-3"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    최근 접수 이력
                  </Button>
                </div>
              </div>

              <div className="space-y-4 md:col-span-3 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 relative">
                  <div className="space-y-4">
                    <h2 className="text-base md:text-lg font-semibold text-[#FF9776]">출발지 정보</h2>
                    <div className="space-y-4">
                      <KakaoAddressSearch
                        key={`sender-${senderInfo.roadAddress}`}
                        initialAddress={senderAddressFormats.display.roadAddress}
                        initialDetailAddress={senderAddressFormats.display.detailAddress}
                        onAddressSelect={handleAddressChange('sender')}
                        onAddressChange={handleAddressChange('sender')}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <MotionInput
                          placeholder="출발지 성함" 
                          className="border-[#FF9776] border-[1.5px] rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50 placeholder:text-gray-400 placeholder:font-light"
                          value={senderInfo.name}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setSenderInfo({...senderInfo, name: e.target.value})}
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                        <MotionInput
                          placeholder="출발지 연락처" 
                          className="col-span-2 border-[#FF9776] border-[1.5px] rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50 placeholder:text-gray-400 placeholder:font-light"
                          value={senderInfo.contact}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setSenderInfo({...senderInfo, contact: e.target.value})}
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="absolute left-1/2 top-[45%] -translate-x-1/2 z-10 hidden md:block">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleSwap}
                        className="hover:bg-[#FFF5F2] border-[#FF9776] text-[#FF9776] rounded-full p-2 shadow-md font-medium"
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                        <span className="sr-only">주소 바꾸기</span>
                      </Button>
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-base md:text-lg font-semibold text-[#FF9776]">도착지 정보</h2>
                    <div className="space-y-4">
                      <KakaoAddressSearch
                        key={`receiver-${receiverInfo.roadAddress}`}
                        initialAddress={receiverAddressFormats.display.roadAddress}
                        initialDetailAddress={receiverAddressFormats.display.detailAddress}
                        onAddressSelect={handleAddressChange('receiver')}
                        onAddressChange={handleAddressChange('receiver')}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <MotionInput
                          placeholder="도착지 성함" 
                          className="border-[#FF9776] border-[1.5px] rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50 placeholder:text-gray-400 placeholder:font-light"
                          value={receiverInfo.name}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setReceiverInfo({...receiverInfo, name: e.target.value})}
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                        <MotionInput
                          placeholder="도착지 연락처" 
                          className="col-span-2 border-[#FF9776] border-[1.5px] rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50 placeholder:text-gray-400 placeholder:font-light"
                          value={receiverInfo.contact}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setReceiverInfo({...receiverInfo, contact: e.target.value})}
                          whileFocus={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:hidden flex justify-center my-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleSwap}
                    className="hover:bg-[#FFF5F2] border-[#FF9776] text-[#FF9776] rounded-full p-2 shadow-md font-medium"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    <span className="sr-only">주소 바꾸기</span>
                  </Button>
                </div>
              </div>
            </div>
          </MotionCard>

          <MotionCard
            className="p-4 md:p-6 mb-6 rounded-lg shadow-[0_4px_18.8px_3px_rgba(255,146,92,0.3)] bg-white border-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-base md:text-lg font-semibold text-[#FF9776] mb-4">물품 종류</h3>
            <div className="grid grid-cols-3 gap-4">
              {['소박스', '중박스', '대박스'].map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`px-2 md:px-4 py-1 md:py-2 text-sm md:text-base rounded-md border border-[#FF9776] ${
                    selectedBoxSize === size
                      ? 'bg-[#FF9776] text-white'
                      : 'bg-white text-[#FF9776]'
                  } transition-colors`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedBoxSize(size as BoxSize);
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </MotionCard>

          <MotionCard
            className="p-4 md:p-6 mb-6 rounded-lg shadow-[0_4px_18.8px_3px_rgba(255,146,92,0.3)] bg-white border-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-base md:text-lg font-semibold text-[#FF9776] mb-4">배송 옵션</h3>
            <div className="mb-6">
              <div className="flex items-start gap-2 text-sm md:text-base text-gray-600">
                <span className="font-semibold text-[#FF9776]">TIP</span>
                <p className="font-light">선택하신 배송 옵션별로 바이크로 배송수단을 주선해드립니다.</p>
              </div>
            </div>

            <div className="mb-6 text-sm md:text-base">
              <span className="font-medium">운영시간 </span>
              <div className="text-sm md:text-base text-gray-600">
                운영시간 월-토: 08:30 - 20:30 / 일,공휴일: 08:30 - 20:30
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex flex-col space-y-2 relative">
                <label className="text-sm md:text-base font-medium">배송경로</label>
                <div className="grid grid-cols-3 gap-4">
                  {['편도', '왕복', '경유'].map((route) => (
                    <ButtonWrapper
                      key={route}
                      isSelected={selectedRoute === route}
                      onSelect={() => setSelectedRoute(route as RouteOption)}
                      className="text-xs md:text-sm py-1 md:py-2"
                    >
                      {route}
                    </ButtonWrapper>
                  ))}
                </div>
                {selectedRoute === '경유' && (
                  <motion.div 
                    className="absolute -top-10 left-[66.66%] z-10 w-[33.33%]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative px-3 py-2 bg-[#FF9776] text-white text-xs md:text-sm rounded-lg">
                      상담 후, 결제가 이뤄집니다.
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-[#FF9776] border-r-[8px] border-r-transparent" />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center relative">
                  <label className="text-sm md:text-base font-medium">기타</label>
                  <div
                    className="ml-2 text-[#FF9776] cursor-pointer"
                    onClick={() => setShowTooltip(!showTooltip)}
                  >
                    <MessageCircle size={16} />
                  </div>
                  {showTooltip && (
                    <div className="absolute left-0 top-6 bg-[#FFF5F2] p-3 rounded-md flex items-start space-x-2 w-64 z-10 shadow-md">
                      <p className="text-xs md:text-sm text-gray-600">
                        기타항목은 선택사항입니다. 선택을 하지않을 경우, 일반배송으로 접수됩니다.
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {['급송', '예약'].map((option) => (
                    <ButtonWrapper
                      key={option}
                      isSelected={selectedOption === option}
                      onSelect={() => setSelectedOption(option as DeliveryOption)}
                      className="text-xs md:text-sm py-1 md:py-2"
                    >
                      {option}
                    </ButtonWrapper>
                  ))}
                </div>
              </div>

              {selectedOption === '예약' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs md:text-sm font-medium whitespace-nowrap">예약일자</label>
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <MotionInput
                          type="text"
                          placeholder="년"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="text-center text-xs md:text-sm border-[#FF9776] border-[1.5px] rounded-md px-2 md:px-4 py-1 md:py-2 focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50"
                        />
                        <MotionInput
                          type="text"
                          placeholder="월"
                          value={month}
                          onChange={(e) => setMonth(e.target.value)}
                          className="text-center text-xs md:text-sm border-[#FF9776] border-[1.5px] rounded-md px-2 md:px-4 py-1 md:py-2 focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50"
                        />
                        <MotionInput
                          type="text"
                          placeholder="일"
                          value={day}
                          onChange={(e) => setDay(e.target.value)}
                          className="text-center text-xs md:text-sm border-[#FF9776] border-[1.5px] rounded-md px-2 md:px-4 py-1 md:py-2 focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs md:text-sm font-medium">시간대</label>
                      <select 
                        className="flex-1 h-8 md:h-10 text-xs md:text-sm rounded-md border-[#FF9776] border-[1.5px] focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50"
                        value={hour}
                        onChange={(e) => setHour(e.target.value)}
                      >
                        {Array.from({length: 24}, (_, i) => (
                          <option key={i} value={String(i)}>{i}시</option>
                        ))}
                      </select>
                      <select 
                        className="flex-1 h-8 md:h-10 text-xs md:text-sm rounded-md border-[#FF9776] border-[1.5px] focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50"
                        value={minute}
                        onChange={(e) => setMinute(e.target.value)}
                      >
                        {Array.from({length: 12}, (_, i) => (
                          <option key={i} value={String(i * 5)}>{i * 5}분</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm md:text-base font-medium">배송수단</label>
                <div className="grid grid-cols-2 gap-4">
                  {['오토바이', '다마스'].map((vehicle) => (
                    <ButtonWrapper
                      key={vehicle}
                      isSelected={selectedVehicle === vehicle}
                      onSelect={() => setSelectedVehicle(vehicle as VehicleOption)}
                      className="text-xs md:text-sm py-1 md:py-2"
                    >
                      {vehicle}
                    </ButtonWrapper>
                  ))}
                </div>
              </div>
            </div>
          </MotionCard>

          <MotionCard
            className="p-4 md:p-6 mb-6 rounded-lg shadow-[0_4px_18.8px_3px_rgba(255,146,92,0.3)] bg-white border-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-base md:text-lg font-semibold text-[#FF9776] mb-4">요청사항</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MotionInput
                  placeholder="요청사항" 
                  className="flex-1 border-[#FF9776] border-[1.5px] rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50 placeholder:text-gray-400 placeholder:font-light"
                  value={requestDetails}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequestDetails(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <MotionInput
                  placeholder="제품 코드" 
                  className="flex-1 border-[#FF9776] border-[1.5px] rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50 placeholder:text-gray-400 placeholder:font-light" 
                  value={productCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductCode(e.target.value)}
                  disabled={isProductCodeNone}
                />
                <ButtonWrapper
                  size="sm"
                  isSelected={isProductCodeNone}
                  onSelect={() => {
                    setIsProductCodeNone(!isProductCodeNone);
                    if (!isProductCodeNone) setProductCode("");
                  }}
                  className="px-3 py-1 text-xs md:text-sm"
                >
                  없음
                </ButtonWrapper>
              </div>
              <div className="flex items-center space-x-2">
                <MotionInput
                  placeholder="오더 번호" 
                  className="flex-1 border-[#FF9776] border-[1.5px] rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50 placeholder:text-gray-400 placeholder:font-light" 
                  value={orderNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderNumber(e.target.value)}
                  disabled={isOrderNumberNone}
                />
                <ButtonWrapper
                  size="sm"
                  isSelected={isOrderNumberNone}
                  onSelect={() => {
                    setIsOrderNumberNone(!isOrderNumberNone);
                    if (!isOrderNumberNone) setOrderNumber("");
                  }}
                  className="px-3 py-1 text-xs md:text-sm"
                >
                  없음
                </ButtonWrapper>
              </div>
              <div className="flex items-center space-x-2">
                <MotionInput
                  placeholder="티켓 번호" 
                  className="flex-1 border-[#FF9776] border-[1.5px] rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50 placeholder:text-gray-400 placeholder:font-light" 
                  value={ticketNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTicketNumber(e.target.value)}
                  disabled={isTicketNumberNone}
                />
                <ButtonWrapper
                  size="sm"
                  isSelected={isTicketNumberNone}
                  onSelect={() => {
                    setIsTicketNumberNone(!isTicketNumberNone);
                    if (!isTicketNumberNone) setTicketNumber("");
                  }}
                  className="px-3 py-1 text-xs md:text-sm"
                >
                  없음
                </ButtonWrapper>
              </div>
              <div className="flex items-center space-x-2">
                <MotionInput
                  placeholder="레지스터" 
                  className="flex-1 border-[#FF9776] border-[1.5px] rounded-md px-3 md:px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50 placeholder:text-gray-400 placeholder:font-light" 
                  value={register}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegister(e.target.value)}
                  disabled={isRegisterNone}
                />
                <ButtonWrapper
                  size="sm"
                  isSelected={isRegisterNone}
                  onSelect={() => {
                    setIsRegisterNone(!isRegisterNone);                    
                    if (!isRegisterNone) setRegister("");
                  }}
                  className="px-3 py-1 text-xs md:text-sm"
                >
                  없음
                </ButtonWrapper>
              </div>
            </div>
          </MotionCard>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 md:mt-8 bg-[#FF9776] hover:bg-[#FF8561] text-white py-3 md:py-4 text-sm md:text-base font-medium rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '처리 중...' : '접수하기'}
          </button>
        </div>
      </form>

      {showRecentOrders && (
        <RecentOrderHistory
          orders={recentOrders}
          onSelect={handleSelectRecentOrder}
          onClose={() => setShowRecentOrders(false)}
        />
      )}
    </div>
  );
}

