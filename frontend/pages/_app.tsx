import { AppProps } from 'next/app';
import { Nunito, Poppins } from 'next/font/google';
import '../styles/globals.css';

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-poppins", 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${nunito.variable} ${poppins.variable} font-nunito antialiased`}>
      <Component {...pageProps} />
    </div>
  );
}
