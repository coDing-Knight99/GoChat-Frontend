export default function Icon({ name, size = 20 }) {
  const paths = {
    message: (
      <path d="M20 15.5a3.5 3.5 0 0 1-3.5 3.5H9l-5 3v-3.8A3.5 3.5 0 0 1 2 15V6.5A3.5 3.5 0 0 1 5.5 3h11A3.5 3.5 0 0 1 20 6.5Z" />
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.3 4.3" />
      </>
    ),
    dots: (
      <>
        <circle cx="5" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="19" cy="12" r="1" fill="currentColor" />
      </>
    ),
    phone: (
      <path d="M7 3.8 4.7 5.2c-.8.5-.9 1.5-.5 2.4 3 6.5 6.4 9.8 12.7 12.5.9.4 1.9.1 2.4-.7l1.2-2.1-4-2.2-1.4 1.7c-2.6-1.2-4.6-3.2-5.9-5.8L11 9.5 7 3.8Z" />
    ),
    video: (
      <path d="M15.5 8.3 20 5.8v12.4l-4.5-2.5v.8A2.5 2.5 0 0 1 13 19H5a2.5 2.5 0 0 1-2.5-2.5v-9A2.5 2.5 0 0 1 5 5h8a2.5 2.5 0 0 1 2.5 2.5Z" />
    ),
    smile: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 14.5s1.3 2 4 2 4-2 4-2M8.5 9.5h.01M15.5 9.5h.01" />
      </>
    ),
    paperclip: (
      <path d="m8.5 12.8 5.8-5.8a3.1 3.1 0 0 1 4.4 4.4l-7.6 7.6a5 5 0 0 1-7-7l7.3-7.4" />
    ),
    send: <path d="m21 3-7.6 18-3.5-7.9L3 9.6 M9.9 13.1 14.5 9" />,
    arrow: <path d="M19 12H5m8-6-6 6 6 6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
