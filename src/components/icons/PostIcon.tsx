type Props = React.SVGProps<SVGSVGElement>

export default function PostIcon(props: Props) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M55 12C55 10.8954 54.1046 10 53 10H47C45.8954 10 45 10.8954 45 12V43C45 44.1046 44.1046 45 43 45H12C10.8954 45 10 45.8954 10 47V53C10 54.1046 10.8954 55 12 55H43C44.1046 55 45 55.8954 45 57V88C45 89.1046 45.8954 90 47 90H53C54.1046 90 55 89.1046 55 88V57C55 55.8954 55.8954 55 57 55H88C89.1046 55 90 54.1046 90 53V47C90 45.8954 89.1046 45 88 45H57C55.8954 45 55 44.1046 55 43V12Z"
        fill="currentColor"
      />
    </svg>
  )
}
