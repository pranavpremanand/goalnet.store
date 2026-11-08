const trackStyle = {
  display: "flex",
  width: "max-content",
  animation: "announcement-marquee 60s linear infinite",
  willChange: "transform",
} as const;

const copyStyle = {
  display: "flex",
  minWidth: "100vw",
  flex: "none",
  alignItems: "center",
  justifyContent: "space-around",
  gap: "4rem",
  padding: "0.55rem 1.5rem",
  whiteSpace: "nowrap",
} as const;

export function AnnouncementMarquee({ text }: { text: string }) {
  return (
    <div aria-hidden="true" className="announcement-marquee-track" style={trackStyle}>
      {[0, 1].map((copy) => (
        <div className="announcement-marquee-copy" key={copy} style={copyStyle}>
          {[0, 1, 2, 3].map((message) => (
            <span className="announcement-marquee-message" key={message} style={{ flex: "none" }}>{text}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
