"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaWeight } from "react-icons/fa";

type WeightEntry = {
  id: string;
  weight_lb: number;
  recorded_at: string;
};

type Profile = {
  height_cm: number | null;
  weight_lb: number | null;
  gender: "male" | "female" | null;
  fitness_goal: "muscle_gain" | "maintenance" | "fat_loss" | null;
  activity_level:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active"
    | null;
  date_of_birth: string | null;
};

export default function WeightTracking() {
  const [newWeight, setNewWeight] = useState<string>("");
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(
          "height_cm, weight_lb, gender, fitness_goal, activity_level, date_of_birth"
        )
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
      } else {
        setProfile(profileData);
      }

      const { data: weightData, error: weightError } = await supabase
        .from("weight_history")
        .select("*")
        .eq("user_id", userId)
        .order("recorded_at", { ascending: true });

      if (weightError) {
        console.error("Error fetching weight history:", weightError.message);
      } else {
        setWeightHistory(weightData || []);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const addWeight = async () => {
    if (!newWeight || isNaN(Number(newWeight))) return;
    setIsLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;
    const weight_lb = parseFloat(newWeight);
    const { error } = await supabase
      .from("weight_history")
      .insert({
        user_id: userId,
        weight_lb,
        recorded_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Error adding weight:", error.message);
      alert(`Failed to add weight: ${error.message}`);
    } else {
      setWeightHistory((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          weight_lb,
          recorded_at: new Date().toISOString(),
        },
      ]);
      setNewWeight("");
    }
    setIsLoading(false);
  };

  const calculateTDEE = () => {
    if (
      !profile?.weight_lb ||
      !profile?.height_cm ||
      !profile?.gender ||
      !profile?.fitness_goal ||
      !profile?.activity_level
    )
      return null;

    const weight_kg = profile.weight_lb / 2.20462;
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
  const startingWeight = profile?.weight_lb || 0;
  const latestWeight =
    weightHistory.length > 0
      ? weightHistory[weightHistory.length - 1].weight_lb
      : startingWeight;
  const netWeightChange = latestWeight - startingWeight;

  const chartData = weightHistory.map((entry) => ({
    date: new Date(entry.recorded_at).toLocaleDateString(),
    weight: entry.weight_lb,
  }));

  return (
    <div className="bg-whoop-card rounded-2xl p-6 shadow-lg shadow-glow border border-whoop-cyan/20">
      <div className="flex items-center mb-6">
        <FaWeight className="text-whoop-green text-3xl mr-3" />
        <h3 className="text-2xl font-bold text-whoop-white tracking-tight">
          Weight Tracking
        </h3>
      </div>
      {isLoading ? (
        <div className="text-center text-whoop-gray">Loading...</div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:space-x-6">
            <input
              type="number"
              placeholder="Enter weight (lb)"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="w-full sm:w-2/3 p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green placeholder-whoop-gray"
            />
            <button
              onClick={addWeight}
              className="mt-4 sm:mt-0 w-full sm:w-1/3 bg-gradient-to-r from-whoop-green to-whoop-cyan text-whoop-dark font-bold py-4 rounded-xl hover:scale-105 hover:shadow-glow transition-transform duration-200"
            >
              Add
            </button>
          </div>
          {tdee && (
            <div className="bg-gradient-to-r from-whoop-dark to-whoop-card p-6 rounded-xl border border-whoop-green/30">
              <h4 className="text-lg font-semibold text-whoop-gray">
                TDEE Goal
              </h4>
              <p className="text-3xl font-bold text-whoop-green">
                {tdee} <span className="text-xl text-whoop-gray">cal/day</span>
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-whoop-dark p-4 rounded-xl border border-whoop-cyan/30">
              <p className="text-sm text-whoop-gray">Starting Weight</p>
              <p className="text-xl font-semibold text-whoop-white">
                {startingWeight} lb
              </p>
            </div>
            <div className="bg-whoop-dark p-4 rounded-xl border border-whoop-cyan/30">
              <p className="text-sm text-whoop-gray">Net Change</p>
              <p
                className={`text-xl font-semibold ${
                  netWeightChange >= 0 ? "text-whoop-green" : "text-red-400"
                }`}
              >
                {netWeightChange >= 0 ? "+" : ""}
                {netWeightChange.toFixed(1)} lb
              </p>
            </div>
          </div>
          {weightHistory.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-whoop-white mb-4">
                Weight Progress
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3B4A54" />
                  <XAxis
                    dataKey="date"
                    stroke="#B0B8C1"
                    tick={{ fill: "#B0B8C1" }}
                  />
                  <YAxis
                    label={{
                      value: "Weight (lb)",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#B0B8C1",
                    }}
                    stroke="#B0B8C1"
                    tick={{ fill: "#B0B8C1" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2E3B45",
                      border: "none",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                    }}
                    itemStyle={{ color: "#FFFFFF" }}
                  />
                  <Legend wrapperStyle={{ color: "#B0B8C1" }} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#39FF14"
                    strokeWidth={3}
                    activeDot={{
                      r: 8,
                      fill: "#00D4FF",
                      stroke: "#39FF14",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
