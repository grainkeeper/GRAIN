import YieldPredictionForm from '@/components/predictions/yield-form';

export default function PredictionsPage() {
  return (
    <div>
      {/* Hero Banner */}
      <section className="w-full bg-gradient-to-r from-green-800 via-green-500 to-yellow-400 py-16 text-white text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Rice Yield Predictions</h1>
          <p className="mt-3 text-white/90 max-w-3xl mx-auto text-base md:text-lg">
            Get precise planting recommendations with our 96.01% accurate ML formula. Enter your
            details below to discover the optimal planting windows for your rice farm.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <div className="container mx-auto px-6 mt-6 md:mt-8 max-w-4xl">
        <YieldPredictionForm />
      </div>
    </div>
  );
}
