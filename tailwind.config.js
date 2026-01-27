/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                accent: '#ff2768',
                body: '#ffffff',
                primary: '#000000',
                secondary: '#1a1a1a',
                lightGray: '#f8f8f8'
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
                serif: ['Archivo', 'sans-serif']
            },
            animation: {
                'subtle-pulse': 'subtlePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'loading-bar': 'loadingBar 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                'scroll-line': 'scrollLine 2.5s cubic-bezier(0.65, 0, 0.35, 1) infinite',
            },
            keyframes: {
                subtlePulse: {
                    '0%, 100%': { transform: 'scale3d(1, 1, 1)' },
                    '50%': { transform: 'scale3d(0.98, 0.98, 1)' },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translate3d(0, 20px, 0)' },
                    '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
                },
                loadingBar: {
                    '0%': { transform: 'translate3d(-100%, 0, 0)' },
                    '100%': { transform: 'translate3d(400%, 0, 0)' }
                },
                scrollLine: {
                    '0%': { transform: 'translateY(-100%)', opacity: '0' },
                    '30%': { opacity: '1' },
                    '60%': { opacity: '1' },
                    '100%': { transform: 'translateY(100%)', opacity: '0' }
                }
            }
        }
    },
    plugins: [],
}
