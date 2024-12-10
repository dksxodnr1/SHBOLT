import { motion, useAnimation } from "framer-motion"
import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'

interface AnimatedLogoProps {
  width?: number;
  height?: number;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ width = 600, height = 160 }) => {
  const controls = useAnimation()
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    const animateLogo = async () => {
      while (true) {
        setShowMessage(true)
        await controls.start({ 
          x: 20, 
          transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
        })
        await new Promise(resolve => setTimeout(resolve, 2000))
        setShowMessage(false)
        await controls.start({ 
          x: 0, 
          transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
        })
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    const startAnimation = async () => {
      try {
        await animateLogo()
      } catch (error) {
        // 애니메이션 오류를 조용히 처리
      }
    }

    startAnimation()

    return () => {
      controls.stop()
    }
  }, [controls])

  return (
    <div className="relative inline-flex items-center pt-8">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ 
          opacity: showMessage ? 1 : 0,
          y: showMessage ? 0 : 10,
          scale: showMessage ? 1 : 0.9
        }}
        transition={{ 
          duration: 0.4,
          ease: "easeOut"
        }}
        className="absolute left-4 top-0 z-10"
      >
        <div className="bg-white text-[#FF9776] px-4 py-2 rounded-full shadow-md flex items-center space-x-2 whitespace-nowrap">
          <MessageCircle size={18} className="flex-shrink-0" />
          <span className="text-sm font-medium">우리는 빠르고 안전합니다!</span>
        </div>
      </motion.div>
      <motion.div 
        animate={controls}
        className="relative z-0"
      >
        <svg width={width} height={height} viewBox="0 0 280 160" className="text-[#FF9776]">
          <path 
            d="M40 80 L120 80 C140 80 160 100 160 120 L200 120 C220 120 240 100 240 80 L240 60 C240 40 220 20 200 20 L180 20" 
            stroke="currentColor" 
            strokeWidth="8" 
            fill="none" 
          />
          <circle 
            cx="220" 
            cy="120" 
            r="30" 
            stroke="currentColor" 
            strokeWidth="8" 
            fill="none" 
          />
          <circle 
            cx="80" 
            cy="120" 
            r="30" 
            stroke="currentColor" 
            strokeWidth="8" 
            fill="none" 
          />
          <text 
            x="140" 
            y="70" 
            textAnchor="middle" 
            className="text-2xl font-bold" 
            fill="currentColor"
          >
            QUINORS
          </text>
        </svg>
      </motion.div>
    </div>
  )
}

