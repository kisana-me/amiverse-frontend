import "./style.css"
import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <ul>
        <li>
          <Link href='/terms-of-service'>利用規約</Link>
        </li>
        <li>
          <Link href='/privacy-policy'>プライバシーポリシー</Link>
        </li>
        <li>
          <Link href='/contact'>お問い合わせ</Link>
        </li>
      </ul>
      <hr />
      <div>© Amiverse</div>
    </footer>
  )
}
