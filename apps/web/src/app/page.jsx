import { Pizza, ChefHat, Clock, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FBFBFB] dark:bg-gray-900 font-inter">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-[#E8E8E8] dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Pizza className="w-8 h-8 text-[#E63946]" />
            <h1 className="ml-2 font-playfair font-semibold text-2xl text-black dark:text-white">
              PizzaFlow
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/account/signin"
              className="font-inter text-sm text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Sign In
            </a>
            <a
              href="/account/signup"
              className="bg-black dark:bg-white text-white dark:text-black font-inter font-semibold text-xs uppercase tracking-widest px-6 py-3 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-[#F5F5F5] dark:bg-gray-800 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-playfair font-medium text-4xl md:text-5xl lg:text-6xl text-black dark:text-white leading-tight mb-6">
                Craft Your Perfect Pizza, Delivered Fresh
              </h2>
              <p className="font-inter text-lg text-[#4D4D4D] dark:text-gray-300 leading-relaxed mb-8">
                Build your dream pizza from scratch with our interactive pizza
                builder. Choose from premium bases, sauces, cheeses, and
                unlimited toppings.
              </p>
              <a
                href="/account/signup"
                className="inline-block bg-black dark:bg-white text-white dark:text-black font-inter font-semibold text-xs uppercase tracking-widest px-8 py-4 hover:bg-gray-800 dark:hover:bg-gray-200 active:bg-gray-900 dark:active:bg-gray-300 transition-colors duration-200"
              >
                Start Building
              </a>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=800&fit=crop"
                alt="Delicious Pizza"
                className="w-full h-[400px] md:h-[500px] object-cover shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="font-playfair font-medium text-3xl md:text-4xl text-black dark:text-white text-center mb-12">
            Why Choose PizzaFlow
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <ChefHat className="w-12 h-12 text-[#E63946]" />
              </div>
              <h4 className="font-inter font-semibold text-xl text-black dark:text-white mb-3">
                Custom Creations
              </h4>
              <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400 leading-6">
                Build your pizza exactly how you want it. From base to toppings,
                every choice is yours.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Clock className="w-12 h-12 text-[#E63946]" />
              </div>
              <h4 className="font-inter font-semibold text-xl text-black dark:text-white mb-3">
                Real-Time Tracking
              </h4>
              <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400 leading-6">
                Track your order from kitchen to doorstep with live status
                updates.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="w-12 h-12 text-[#E63946]" />
              </div>
              <h4 className="font-inter font-semibold text-xl text-black dark:text-white mb-3">
                Secure Payments
              </h4>
              <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400 leading-6">
                Pay securely with Razorpay integration and complete peace of
                mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="font-playfair font-medium text-3xl md:text-4xl text-white mb-6">
            Ready to Create Your Perfect Pizza?
          </h3>
          <p className="font-inter text-lg text-gray-300 mb-8">
            Join thousands of pizza lovers who trust PizzaFlow for their custom
            creations.
          </p>
          <a
            href="/account/signup"
            className="inline-block bg-white text-black font-inter font-semibold text-xs uppercase tracking-widest px-8 py-4 hover:bg-gray-200 active:bg-gray-300 transition-colors duration-200"
          >
            Get Started Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-[#E8E8E8] dark:border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Pizza className="w-6 h-6 text-[#E63946]" />
              <span className="ml-2 font-playfair font-semibold text-lg text-black dark:text-white">
                PizzaFlow
              </span>
            </div>
            <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
              © 2026 PizzaFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        .font-playfair {
          font-family: 'Playfair Display', Georgia, serif;
        }
      `}</style>
    </div>
  );
}
