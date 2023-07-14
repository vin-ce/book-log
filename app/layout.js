import './globals.sass'
import { Source_Code_Pro } from 'next/font/google'

const source_code_pro = Source_Code_Pro({ subsets: ['latin'] })

import Nav from './components/nav'

export const metadata = {
  title: 'Book Log',
  description: 'Logging Books',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={source_code_pro.className}>
        <Nav />
        {children}
      </body>
    </html>
  )
}
