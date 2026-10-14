import type { Metadata } from 'next'; import './globals.css';
export const metadata: Metadata={title:'Centro de Belleza Carmen | Pilas',description:'Peluquería y estética en Pilas',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
