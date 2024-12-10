'use client'

import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { useAuth } from '@/app/AuthContext'
import { getOAuthToken } from '@/app/api/auth'
import { toast } from 'sonner'

interface UserInfoProps {
  className?: string
}

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

export function UserInfo({ className = '' }: UserInfoProps) {
  const { userId } = useAuth()
  const [mileage, setMileage] = useState<string>('0')
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    const fetchMileage = async () => {
      if (!userId) {
        setMileage('0');
        setIsLoading(false);
        return;
      }

      try {
        const token = await getOAuthToken();
        if (!token) {
          throw new Error('토큰을 받아오는데 실패했습니다.');
        }

        const response = await fetch('/api/mileage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            m_code: '1119',
            cc_code: '2076',
            user_id: userId,
            token: token,
            type: 'xml'
          }),
        });

        const data = await response.json();

        if (data.code === '1000') {
          setMileage(data.mileage || '0');
        } else {
          setMileage('0');
        }
      } catch (error) {
        console.error('마일리지 조회 오류:', error);
        setMileage('0');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMileage();
  }, [userId]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 bg-[#FFF5F2] px-3 py-2 rounded-lg">
        <User className="w-5 h-5 text-[#FF9776]" />
        {!isMobile && (
          <span className="text-sm font-medium text-gray-600">
            {userId || '게스트'}
          </span>
        )}
      </div>
      {!isMobile && (
        <div className="bg-[#FFF5F2] px-3 py-2 rounded-lg">
          <span className="text-sm text-gray-600">보유 마일리지: </span>
          <span className="text-sm font-bold text-[#FF9776]">
            {isLoading ? '로딩중...' : `${Number(mileage).toLocaleString()}P`}
          </span>
        </div>
      )}
    </div>
  )
}

