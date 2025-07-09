"use client";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Inter } from "next/font/google";
import "node_modules/react-modal-video/css/modal-video.css";
import "../styles/index.css";
import { showSuccess } from '@/utils/toastService';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WCSPQTRF');
>>>>>>> 849ef95 (fix metric final)
          `}
        </Script>
      </head>
      <body className={`bg-[#FCFCFC] dark:bg-black ${inter.className}`}>
        <noscript>
          <iframe

            src="https://www.googletagmanager.com/ns.html?id=GTM-WCSPQTRF"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>

        <Providers>
          <Header />
          <>
            <ToastContainer
              position="top-right"        // 👈 Hiển thị góc phải trên
              autoClose={5000}            // Tự tắt sau 3s
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"              // Có thể đổi sang 'dark' nếu cần
            />            {children}
          </>
          <Footer />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

import { Providers } from "./providers";
