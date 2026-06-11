import "./style.css"
import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <ul>
        <li>
          <Link prefetch={false} href='/terms-of-service'>利用規約</Link>
        </li>
        <li>
          <Link prefetch={false} href='/privacy-policy'>プライバシーポリシー</Link>
        </li>
        <li>
          <Link prefetch={false} href='/contact'>お問い合わせ</Link>
        </li>
      </ul>
      <hr />
      <div>© Amiverse</div>
    </footer>
  )
}
