import "./Divider.css";

export default function Divider({
  margin = "md",
}) {
  return (
    <hr
      className={`divider divider--${margin}`}
    />
  );
}