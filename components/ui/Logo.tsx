interface LogoProps {
  size?: number;
}

export default function Logo({ size = 18 }: LogoProps) {
  return (
    <span className="klaro-logo" style={{ fontSize: size }}>
      klar<span className="o">o</span>
    </span>
  );
}
