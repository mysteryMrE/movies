import { useState } from "react";

function HeartButton() {
  const [liked, setLiked] = useState(false);
  return (
    <button
      className="heart-btn"
      onClick={() => setLiked((prev) => !prev)}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill={liked ? "red" : "white"}
        stroke="black"
        strokeWidth="1"
        strokeLinejoin="round"
      >
        <path d="M12 21s-6.2-4.35-8.4-7.09C1.1 11.13 1.6 8.28 4.05 6.73 6.5 5.18 9.24 6.09 12 8.58c2.76-2.49 5.5-3.4 7.95-1.85 2.45 1.55 2.95 4.4.45 7.18C18.2 16.65 12 21 12 21z" />
      </svg>
    </button>
  );
}
export default HeartButton;
