"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";

export default function Header() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  }

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".profile-menu")) setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isDropdownOpen]);

  return (
    <header className="bg-whoop-dark shadow-xl p-4 border-b border-whoop-cyan/20 relative z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/workout">
          <h1 className="text-xl sm:text-2xl font-bold text-whoop-green hover:text-whoop-cyan transition-colors duration-200">
            SetRep
          </h1>
        </Link>
        <div className="relative profile-menu">
          <button
            onClick={toggleDropdown}
            className="flex items-center focus:outline-none p-1 rounded-full hover:bg-whoop-dark/50 transition-colors duration-200"
            aria-label="User Profile"
          >
            <FaUserCircle className="w-7 h-7 text-whoop-white hover:text-whoop-green transition-colors duration-200" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-black rounded-lg shadow-xl border border-whoop-cyan/30 z-50 opacity-100 transition-all duration-200">
              <ul className="py-2">
                <li>
                  <Link href="/profile">
                    <span className="block px-4 py-2 text-whoop-white hover:bg-whoop-dark/50 hover:text-whoop-green transition-colors duration-200 text-sm font-medium">
                      Profile
                    </span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-whoop-white hover:bg-whoop-dark/50 hover:text-whoop-green disabled:text-whoop-gray/70 disabled:hover:bg-whoop-card transition-colors duration-200 text-sm font-medium"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
