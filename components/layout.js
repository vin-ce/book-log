import Nav from './nav/nav'
import { Source_Code_Pro } from 'next/font/google'

const source_code_pro = Source_Code_Pro({ subsets: ['latin'] })

export default function Layout({ children }) {

  return (
    <>
      <div className={source_code_pro.className}>
        <Nav />
        <main>
          {children}
        </main>
      </div>
    </>
  )
}
