export default { content: ['./index.html', './*.tsx', './constants.ts', './components/**/*.tsx'], ...{
      theme: {
        extend: {
          fontFamily: {
            sans: ['Zen Maru Gothic', 'sans-serif'],
            serif: ['Kiwi Maru', 'serif'],
          },
          colors: {
            'kids-bg': '#FFF9F0',       // 優しいクリーム色
            'kids-text': '#4A4A4A',     // 濃いグレー（黒より優しい）
            'pop-red': '#DC2626',
            'pop-blue': '#4CC9F0',      // 空色
            'pop-pink': '#F72585',      // 元気なピンク
            'pop-yellow': '#FFD60A',    // 鮮やかな黄色
            'pop-green': '#06D6A0',     // 元気な緑
            'pop-purple': '#7209B7',    // ポップな紫
            'card-white': '#FFFFFF',
            'pastel-blue': '#E0F7FA',
            'pastel-pink': '#FCE4EC',
            'pastel-yellow': '#FFF9C4',
            'pastel-green': '#E8F5E9',
          },
          backgroundImage: {
            'dots': "radial-gradient(#E0E0E0 2px, transparent 2px)",
            'stripes': "repeating-linear-gradient(45deg, rgba(255,255,255,0.5), rgba(255,255,255,0.5) 10px, transparent 10px, transparent 20px)",
          },
          boxShadow: {
            'pop': '4px 4px 0px 0px rgba(0,0,0,0.15)',
            'pop-hover': '2px 2px 0px 0px rgba(0,0,0,0.15)',
            'card': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
          },
          animation: {
            'bounce-slight': 'bounce-slight 2s infinite',
            'wiggle': 'wiggle 1s ease-in-out infinite',
            'spin-slow': 'spin 8s linear infinite',
            'float': 'float 3s ease-in-out infinite',
          },
          keyframes: {
            'bounce-slight': {
              '0%, 100%': { transform: 'translateY(-3px)' },
              '50%': { transform: 'translateY(3px)' },
            },
            'wiggle': {
              '0%, 100%': { transform: 'rotate(-3deg)' },
              '50%': { transform: 'rotate(3deg)' },
            },
            'float': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-10px)' },
            }
          }
        }
      }
    } };
