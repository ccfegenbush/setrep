"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

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
      setIsDropdownOpen(false); // Close dropdown on logout
    }
  }

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".profile-menu")) {
      setIsDropdownOpen(false);
    }
  };

  // Add event listener for clicks outside dropdown
  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  return (
    <header className="bg-white shadow-md p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/workout">
          <h1 className="text-2xl font-semibold text-gray-800 cursor-pointer">
            SetRep
          </h1>
        </Link>
        <div className="relative profile-menu">
          <button
            onClick={toggleDropdown}
            className="flex items-center focus:outline-none"
            aria-label="User Profile"
          >
            <svg
              className="w-8 h-8 text-gray-800 hover:text-gray-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <ul className="py-1">
                <li>
                  <Link href="/profile">
                    <span className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer transition-colors">
                      View Profile
                    </span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 disabled:text-gray-400 transition-colors"
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
