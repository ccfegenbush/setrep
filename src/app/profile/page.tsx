/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { FaUser } from "react-icons/fa";

type Profile = {
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  gender: "male" | "female" | null;
  height_cm: number | null;
  weight_lb: number | null;
  fitness_goal: "muscle_gain" | "maintenance" | "fat_loss" | null;
  activity_level:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active"
    | null;
  date_of_birth: string | null; // 'YYYY-MM-DD'
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    full_name: null,
    email: null,
    phone_number: null,
    gender: null,
    height_cm: null,
    weight_lb: null,
    fitness_goal: null,
    activity_level: null,
    date_of_birth: null,
  });
  const [heightFeet, setHeightFeet] = useState<string>("");
  const [heightInches, setHeightInches] = useState<string>("");
  const [startingWeight, setStartingWeight] = useState<string>("");
  const [dobMonth, setDobMonth] = useState<string>("");
  const [dobDay, setDobDay] = useState<string>("");
  const [dobYear, setDobYear] = useState<string>("1996");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const startYear = 1925;
  const endYear = 2055;

  useEffect(() => {
    if (profile.height_cm) {
      const totalInches = profile.height_cm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      setHeightFeet(feet.toString());
      setHeightInches(inches.toString());
    }
  }, [profile.height_cm]);

  useEffect(() => {
    if (profile.date_of_birth) {
      const [year, month, day] = profile.date_of_birth.split("-");
      const yearNum = parseInt(year);
      if (yearNum >= startYear && yearNum <= endYear) {
        setDobYear(year);
      } else {
        setDobYear("");
      }
      setDobMonth(month);
      setDobDay(day);
    }
  }, [profile.date_of_birth]);

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      const userId = session.user.id;
      setUserId(userId);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error(
          "Error fetching profile:",
          profileError.message,
          profileError.details
        );
      } else if (profileData) {
        setProfile(profileData);
        setStartingWeight(profileData.weight_lb?.toString() || "");
      }
      setIsLoading(false);
    }
    fetchProfile();
  }, [router]);

  const ensureProfileExists = async () => {
    if (!userId) return;
    const { data: existingProfile, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking profile:", error.message, error.details);
      return;
    }

    if (!existingProfile) {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ id: userId });
      if (insertError) {
        console.error(
          "Error creating profile:",
          insertError.message,
          insertError.details
        );
      }
    }
  };

  const saveProfile = async () => {
    if (!userId) return;
    setIsLoading(true);

    await ensureProfileExists();

    const height_cm =
      (parseInt(heightFeet) || 0) * 12 * 2.54 +
      (parseInt(heightInches) || 0) * 2.54;
    const weight_lb = startingWeight ? parseFloat(startingWeight) : null;
    const date_of_birth =
      dobYear && dobMonth && dobDay
        ? `${dobYear}-${String(dobMonth).padStart(2, "0")}-${String(
            dobDay
          ).padStart(2, "0")}`
        : null;
    const updatedProfile = { ...profile, height_cm, weight_lb, date_of_birth };
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        ...updatedProfile,
        updated_at: new Date().toISOString(),
      });
    if (error) {
      console.error("Error saving profile:", error.message, error.details);
      alert(`Failed to save profile: ${error.message}`);
    } else {
      setProfile(updatedProfile);
      alert("Profile saved successfully!");
    }
    setIsLoading(false);
  };

  const calculateTDEE = () => {
    if (
      !startingWeight ||
      !profile.height_cm ||
      !profile.gender ||
      !profile.fitness_goal ||
      !profile.activity_level
    )
      return null;

    const weight_kg = parseFloat(startingWeight) / 2.20462;
    const height = profile.height_cm;
    const today = new Date();
    const birthDate = profile.date_of_birth
      ? new Date(profile.date_of_birth)
      : null;
    let age = 30;
    if (birthDate) {
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }
    let bmr: number;
    if (profile.gender === "male") {
      bmr = 10 * weight_kg + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight_kg + 6.25 * height - 5 * age - 161;
    }
    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const tdee = bmr * (multipliers[profile.activity_level] || 1.2);

    switch (profile.fitness_goal) {
      case "muscle_gain":
        return Math.round(tdee + 300);
      case "fat_loss":
        return Math.round(tdee - 500);
      case "maintenance":
        return Math.round(tdee);
      default:
        return Math.round(tdee);
    }
  };

  const tdee = calculateTDEE();

  return (
    <div className="min-h-screen bg-whoop-dark text-whoop-white">
      <Header />
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        {isLoading ? (
          <div className="bg-whoop-card rounded-2xl p-6 shadow-lg shadow-glow border border-whoop-cyan/20 text-center min-h-[100px] flex items-center justify-center">
            <div className="text-whoop-gray">Loading...</div>
          </div>
        ) : (
          <div className="bg-whoop-card rounded-2xl p-6 shadow-lg shadow-glow border border-whoop-cyan/20">
            <div className="flex items-center mb-8">
              <FaUser className="text-whoop-green text-3xl mr-3" />
              <h2 className="text-4xl font-bold tracking-tight">
                Your Profile
              </h2>
            </div>

            {/* Contact Info */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-whoop-white mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={profile.full_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  className="w-full p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green placeholder-whoop-gray"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={profile.email || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className="w-full p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green placeholder-whoop-gray"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={profile.phone_number || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, phone_number: e.target.value })
                  }
                  className="w-full p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green placeholder-whoop-gray"
                />
              </div>
            </section>

            {/* Personal Details */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-whoop-white mb-4">
                Personal Details
              </h3>
              <div className="space-y-6">
                <select
                  value={profile.gender || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      gender: e.target.value as "male" | "female",
                    })
                  }
                  className="w-full p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green"
                >
                  <option value="" className="text-whoop-gray">
                    Select Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <div>
                  <p className="text-sm font-semibold text-whoop-gray mb-2">
                    Date of Birth
                  </p>
                  <div className="flex space-x-4">
                    <select
                      value={dobMonth}
                      onChange={(e) => setDobMonth(e.target.value)}
                      className="w-1/3 p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green"
                    >
                      <option value="" className="text-whoop-gray">
                        Month
                      </option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (month) => (
                          <option key={month} value={month}>
                            {new Date(0, month - 1).toLocaleString("default", {
                              month: "long",
                            })}
                          </option>
                        )
                      )}
                    </select>
                    <select
                      value={dobDay}
                      onChange={(e) => setDobDay(e.target.value)}
                      className="w-1/3 p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green"
                    >
                      <option value="" className="text-whoop-gray">
                        Day
                      </option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(
                        (day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        )
                      )}
                    </select>
                    <select
                      value={dobYear}
                      onChange={(e) => setDobYear(e.target.value)}
                      className="w-1/3 p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green"
                    >
                      <option value="" className="text-whoop-gray">
                        Year
                      </option>
                      {Array.from(
                        { length: endYear - startYear + 1 },
                        (_, i) => endYear - i
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-whoop-gray mb-2">
                    Height
                  </p>
                  <div className="flex space-x-4">
                    <select
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(e.target.value)}
                      className="w-1/2 p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green"
                    >
                      <option value="" className="text-whoop-gray">
                        Feet
                      </option>
                      {Array.from({ length: 4 }, (_, i) => i + 4).map((ft) => (
                        <option key={ft} value={ft}>
                          {ft} ft
                        </option>
                      ))}
                    </select>
                    <select
                      value={heightInches}
                      onChange={(e) => setHeightInches(e.target.value)}
                      className="w-1/2 p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green"
                    >
                      <option value="" className="text-whoop-gray">
                        Inches
                      </option>
                      {Array.from({ length: 12 }, (_, i) => i).map((inch) => (
                        <option key={inch} value={inch}>
                          {inch} in
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <input
                  type="number"
                  placeholder="Weight (lb)"
                  value={startingWeight}
                  onChange={(e) => setStartingWeight(e.target.value)}
                  className="w-full p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green placeholder-whoop-gray"
                />
              </div>
            </section>

            {/* Fitness Goal */}
            <section className="mb-8">
              <h3 className="text-2xl font-semibold text-whoop-white mb-4">
                Fitness Goal
              </h3>
              <div className="space-y-6">
                <select
                  value={profile.fitness_goal || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      fitness_goal: e.target.value as any,
                    })
                  }
                  className="w-full p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green"
                >
                  <option value="" className="text-whoop-gray">
                    Select Goal
                  </option>
                  <option value="muscle_gain">Put on Muscle</option>
                  <option value="maintenance">Maintain</option>
                  <option value="fat_loss">Burn Fat</option>
                </select>
                <select
                  value={profile.activity_level || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      activity_level: e.target.value as any,
                    })
                  }
                  className="w-full p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green"
                >
                  <option value="" className="text-whoop-gray">
                    Select Activity Level
                  </option>
                  <option value="sedentary">
                    Sedentary (little to no exercise)
                  </option>
                  <option value="light">
                    Light (light exercise 1-3 days/week)
                  </option>
                  <option value="moderate">
                    Moderate (moderate exercise 3-5 days/week)
                  </option>
                  <option value="active">
                    Active (hard exercise 6-7 days/week)
                  </option>
                  <option value="very_active">
                    Very Active (very hard exercise & physical job)
                  </option>
                </select>
                {tdee && (
                  <div className="bg-gradient-to-r from-whoop-dark to-whoop-card p-6 rounded-xl border border-whoop-green/30 text-center">
                    <h4 className="text-lg font-semibold text-whoop-gray mb-2">
                      Target Daily Calorie Intake
                    </h4>
                    <div className="flex justify-center">
                      <span className="text-5xl font-bold text-whoop-green">
                        {tdee}
                      </span>
                    </div>
                    <p className="text-whoop-gray mt-2">
                      calories to achieve your{" "}
                      {profile.fitness_goal?.replace("_", " ")} goal
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Save Button */}
            <button
              onClick={saveProfile}
              className="w-full px-6 py-4 bg-gradient-to-r from-whoop-green to-whoop-cyan text-whoop-dark font-bold rounded-xl hover:scale-105 hover:shadow-glow transition-transform duration-200 disabled:bg-whoop-gray disabled:text-whoop-dark disabled:scale-100 disabled:shadow-none"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
