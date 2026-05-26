type TeamStripeProps = { color: string };

export default function TeamStripe({ color }: TeamStripeProps) {
  return <div style={{ background: color, height: 5 }} className="w-full" />;
}
