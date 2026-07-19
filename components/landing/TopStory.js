export default function TopStory({ text }) {
  if (!text) return null;

  return (
    <div className="border-b border-line/70 bg-accent-soft">
      <div className="container-page py-4">
        <p className="text-center font-display text-lg font-extrabold leading-snug text-accent-hover sm:text-xl">
          {text}
        </p>
      </div>
    </div>
  );
}
