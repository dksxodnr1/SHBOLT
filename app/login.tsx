'use client'

import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthContext'
import { Toaster, toast } from 'sonner'
import { getOAuthToken } from './api/auth'

const MotionCard = motion(Card)
const MotionInput = motion(Input)

const LogoAnimation = () => {
  return (
    <motion.svg
      width="280"
      height="160"
      viewBox="0 0 280 160"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        rotate: [0, 2, -2, 0],
      }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        rotate: {
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
        }
      }}
      className="text-[#FF9776]"
    >
      <motion.path
        d="M40 80 L120 80 C140 80 160 100 160 120 L200 120 C220 120 240 100 240 80 L240 60 C240 40 220 20 200 20 L180 20"
        stroke="currentColor"
        strokeWidth="8"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      />
      <motion.circle
        cx="220"
        cy="120"
        r="30"
        stroke="currentColor"
        strokeWidth="8"
        fill="none"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      />
      <motion.circle
        cx="80"
        cy="120"
        r="30"
        stroke="currentColor"
        strokeWidth="8"
        fill="none"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      />
      <motion.text
        x="140"
        y="70"
        textAnchor="middle"
        className="text-2xl font-bold"
        fill="currentColor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        QUINORS
      </motion.text>
    </motion.svg>
  )
}

export default function LoginPage() {
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = useCallback(async () => {
    if (!userId.trim() || !password) {
      toast.error('아이디와 비밀번호를 입력해주세요');
      return false;
    }

    try {
      const token = await getOAuthToken();
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          m_code: '1119',
          cc_code: '2076',
          token,
          user_id: userId,
          password,
        }),
      });

      const data = await response.json();

      if (data.code === '1000') {
        login(userId);
        router.push('/Order');
        return true;
      } else {
        toast.error(data.msg || '로그인에 실패했습니다');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('로그인 처리 중 오류가 발생했습니다');
      return false;
    }
  }, [userId, password, login, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await handleLogin();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F2] flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <MotionCard
        className="w-full max-w-md p-8 rounded-lg shadow-[0_4px_18.8px_3px_rgba(255,146,92,0.3)] bg-white border-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <LogoAnimation />
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="userId" className="text-sm font-medium text-gray-700">아이디</label>
            <MotionInput
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="아이디를 입력하세요"
              className="w-full border-[#FF925C] border-[1.5px] focus-visible:ring-[#FF925C] focus-visible:ring-[2px] focus:outline-none"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">비밀번호</label>
            <div className="relative">
              <MotionInput
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full border-[#FF925C] border-[1.5px] focus-visible:ring-[#FF925C] focus-visible:ring-[2px] focus:outline-none pr-10"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#FF9776] hover:bg-[#FF8561] text-white py-2 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF9776] focus:ring-opacity-50"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
          <Link href="/forgot-password" className="text-[#FF9776] hover:underline">
            비밀번호를 잊으셨나요?
          </Link>
          <Link href="/signup" className="text-[#FF9776] hover:underline">
            회원가입
          </Link>
        </div>
      </MotionCard>
    </div>
  )
}

