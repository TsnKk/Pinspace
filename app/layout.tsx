import type { Metadata } from "next";import "./globals.css";
export const metadata:Metadata={title:"Pinspace — บอร์ดรูปและไอเดียของคุณ",description:"เก็บรูปภาพ โน้ต แหล่งอ้างอิง และแท็ก บนแคนวาสที่จัดวางได้อย่างอิสระ",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th"><body>{children}</body></html>}
