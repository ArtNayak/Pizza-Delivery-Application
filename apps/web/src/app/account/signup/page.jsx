import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { Pizza } from "lucide-react";

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      await signUpWithCredentials({
        email,
        password,
        name: name || undefined,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err) {
      setError("This email is already registered. Try signing in instead.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] dark:bg-gray-900 flex items-center justify-center p-4 font-inter">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white dark:bg-gray-800 p-8 md:p-12 rounded-sm shadow-sm"
      >
        <div className="flex items-center justify-center mb-8">
          <Pizza className="w-10 h-10 text-[#E63946]" />
          <h1 className="ml-3 font-playfair font-semibold text-3xl text-black dark:text-white">
            PizzaFlow
          </h1>
        </div>

        <h2 className="font-inter text-2xl font-medium text-black dark:text-white mb-2">
          Create Account
        </h2>
        <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400 mb-8">
          Start your pizza adventure today
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block font-inter text-xs uppercase tracking-wider text-black dark:text-white opacity-60">
              Name (Optional)
            </label>
            <input
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-[#F5F5F5] dark:bg-gray-700 border border-[#E8E8E8] dark:border-gray-600 px-4 py-3 text-sm font-inter text-black dark:text-white placeholder-[#999] dark:placeholder-gray-500 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-inter text-xs uppercase tracking-wider text-black dark:text-white opacity-60">
              Email
            </label>
            <input
              required
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-[#F5F5F5] dark:bg-gray-700 border border-[#E8E8E8] dark:border-gray-600 px-4 py-3 text-sm font-inter text-black dark:text-white placeholder-[#999] dark:placeholder-gray-500 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-inter text-xs uppercase tracking-wider text-black dark:text-white opacity-60">
              Password
            </label>
            <input
              required
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-[#F5F5F5] dark:bg-gray-700 border border-[#E8E8E8] dark:border-gray-600 px-4 py-3 text-sm font-inter text-black dark:text-white placeholder-[#999] dark:placeholder-gray-500 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          {error && (
            <div className="bg-[#FFEAEA] dark:bg-red-900/20 border border-[#E63946] dark:border-red-800 p-3 text-sm font-inter text-[#E63946] dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black dark:bg-white text-white dark:text-black font-inter font-semibold text-xs uppercase tracking-widest px-8 py-4 hover:bg-gray-800 dark:hover:bg-gray-200 active:bg-gray-900 dark:active:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="text-center font-inter text-sm text-[#6B6B6B] dark:text-gray-400">
            Already have an account?{" "}
            <a
              href="/account/signin"
              className="text-black dark:text-white underline hover:no-underline transition-all"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>

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
