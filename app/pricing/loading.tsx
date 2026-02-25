export default function PricingLoading() {
  return (
    <div className="pt-32 pb-16 bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-12 w-72 mx-auto bg-white/10 rounded-lg animate-pulse mb-6" />
        <div className="h-6 w-96 mx-auto bg-white/5 rounded-lg animate-pulse mb-12" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
