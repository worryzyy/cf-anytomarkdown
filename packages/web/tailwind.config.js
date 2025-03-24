/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			typography: {
				DEFAULT: {
					css: {
						maxWidth: '100%',
						code: {
							backgroundColor: '#f3f4f6',
							paddingLeft: '4px',
							paddingRight: '4px',
							paddingTop: '2px',
							paddingBottom: '2px',
							borderRadius: '0.25rem',
							fontWeight: '400'
						},
						'code::before': {
							content: '""'
						},
						'code::after': {
							content: '""'
						},
						pre: {
							backgroundColor: '#f3f4f6',
							padding: '1rem',
							borderRadius: '0.5rem',
							fontSize: '0.875rem',
							lineHeight: '1.5'
						},
						'pre code': {
							backgroundColor: 'transparent',
							padding: '0'
						}
					}
				}
			}
		}
	},
	plugins: [require('@tailwindcss/typography')]
}
