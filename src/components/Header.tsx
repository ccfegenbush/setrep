"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa"; // Updated icon

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

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".profile-menu")) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  return (
    <header className="bg-whoop-dark shadow-lg p-4 border-b border-whoop-cyan/20">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/workout">
          <h1 className="text-3xl font-bold text-whoop-green tracking-tight cursor-pointer hover:text-whoop-cyan transition-colors">
            SetRep
          </h1>
        </Link>
        <div className="relative profile-menu">
          <button
            onClick={toggleDropdown}
            className="flex items-center focus:outline-none"
            aria-label="User Profile"
          >
            <FaUserCircle className="w-8 h-8 text-whoop-white hover:text-whoop-green transition-colors" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-whoop-card rounded-xl shadow-lg shadow-glow z-10 border border-whoop-cyan/30">
              <ul className="py-2">
                <li>
                  <Link href="/profile">
                    <span className="block px-4 py-2 text-whoop-white hover:bg-whoop-dark hover:text-whoop-green cursor-pointer transition-colors">
                      View Profile
                    </span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-whoop-white hover:bg-whoop-dark hover:text-whoop-green disabled:text-whoop-gray disabled:hover:bg-whoop-card transition-colors"
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
