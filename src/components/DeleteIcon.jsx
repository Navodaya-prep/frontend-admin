const DeleteIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 115"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Handle */}
    <rect x="32" y="0" width="36" height="20" rx="10" fill="#e53935" />
    {/* Lid */}
    <rect x="5" y="22" width="90" height="18" rx="9" fill="#e53935" />
    {/* Body */}
    <rect x="12" y="44" width="76" height="71" rx="12" fill="#e53935" />
    {/* Left stripe */}
    <rect x="33" y="56" width="10" height="47" rx="5" fill="white" />
    {/* Right stripe */}
    <rect x="57" y="56" width="10" height="47" rx="5" fill="white" />
  </svg>
)

export default DeleteIcon
