import useAuth from "@/utils/useAuth";
import { Pizza } from "lucide-react";

export default function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] dark:bg-gray-900 flex items-center justify-center p-4 font-inter">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 md:p-12 rounded-sm shadow-sm text-center">
        <div className="flex items-center justify-center mb-8">
          <Pizza className="w-10 h-10 text-[#E63946]" />
          <h1 className="ml-3 font-playfair font-semibold text-3xl text-black dark:text-white">
            PizzaFlow
          </h1>
        </div>

        <h2 className="font-inter text-2xl font-medium text-black dark:text-white mb-2">
          Sign Out
        </h2>
        <p className="font-inter text-sm text-[#6B6B6B] dark:text-gray-400 mb-8">
          Are you sure you want to sign out?
        </p>

        <button
          onClick={handleSignOut}
          className="w-full bg-black dark:bg-white text-white dark:text-black font-inter font-semibold text-xs uppercase tracking-widest px-8 py-4 hover:bg-gray-800 dark:hover:bg-gray-200 active:bg-gray-900 dark:active:bg-gray-300 transition-colors duration-200"
        >
          Sign Out
        </button>
      </div>

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
