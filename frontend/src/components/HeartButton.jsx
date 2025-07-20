function HeartButton({ liked, onClick }) {
  return (
    <button
      className="heart-btn"
      onClick={onClick}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill={liked ? "#ff4757" : "none"}
        stroke={liked ? "#ff4757" : "#ffffff"}
        strokeWidth="2"
        strokeLinejoin="round"
        style={{
          filter: liked
            ? "drop-shadow(0 0 8px rgba(255, 71, 87, 0.5))"
            : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
          transition: "all 0.3s ease",
        }}
      >
        <path d="M12 21s-6.2-4.35-8.4-7.09C1.1 11.13 1.6 8.28 4.05 6.73 6.5 5.18 9.24 6.09 12 8.58c2.76-2.49 5.5-3.4 7.95-1.85 2.45 1.55 2.95 4.4.45 7.18C18.2 16.65 12 21 12 21z" />
      </svg>
    </button>
  );
}

export default HeartButton;
