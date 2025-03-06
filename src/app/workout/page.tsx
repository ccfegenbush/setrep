"use client";

import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import ExerciseLog from "@/components/ExerciseLog";
import RestTimer from "@/components/RestTimer";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Exercise } from "@/types";
import Link from "next/link";
import TemplateItem from "@/components/TemplateItem";

// Define the Template type
type Template = {
  id: string;
  name: string;
};

// Define props for the DeleteConfirmationModal
type DeleteConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  templateName: string;
};

// DeleteConfirmationModal component
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  templateName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Delete Workout
        </h3>
        <p className="text-gray-700 mb-4">
          Are you sure you want to delete the workout &quot;{templateName}
          &quot;?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Workout() {
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isStartingWorkout, setIsStartingWorkout] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPreviousWorkouts, setShowPreviousWorkouts] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(
    null
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch user session and templates on mount
  useEffect(() => {
    async function fetchUserAndTemplates() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) {
        router.push("/login");
      } else {
        setUserId(session.user.id);
        const { data: templateData, error: templateError } = await supabase
          .from("templates")
          .select("id, name")
          .eq("user_id", session.user.id);
        if (templateError) {
          console.error("Error fetching templates:", templateError);
        } else {
          setTemplates(templateData || []);
        }
      }
    }
    fetchUserAndTemplates();
  }, [router]);

  // Set workoutId from query parameter if provided
  useEffect(() => {
    const initialWorkoutId = searchParams.get("workoutId");
    if (initialWorkoutId && !workoutId) {
      setWorkoutId(initialWorkoutId);
    }
  }, [searchParams, workoutId]);

  // Fetch exercises when workoutId changes
  useEffect(() => {
    async function fetchExercises() {
      if (!workoutId) return;
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("workout_id", workoutId);
      if (error) {
        console.error("Error fetching exercises:", error);
      } else {
        setExercises(data || []);
      }
    }
    fetchExercises();
  }, [workoutId]);

  // Start a new workout manually
  async function startWorkout() {
    if (!userId) {
      alert("Please log in first!");
      return;
    }
    setIsStartingWorkout(true);
    try {
      const { data, error } = await supabase
        .from("workouts")
        .insert({ name: "New Workout", user_id: userId })
        .select()
        .single();
      if (error) throw error;
      setWorkoutId(data.id);
    } catch (error) {
      console.error("Error starting workout:", error);
      alert("Failed to start workout. Please try again.");
    } finally {
      setIsStartingWorkout(false);
    }
  }

  // Start a workout from a template
  async function startFromTemplate(templateId: string) {
    if (!userId) {
      alert("Please log in first!");
      return;
    }
    setIsStartingWorkout(true);
    try {
      const { data: templateData, error: templateError } = await supabase
        .from("templates")
        .select("name")
        .eq("id", templateId)
        .single();
      if (templateError) throw templateError;

      const { data: templateExercises, error: exercisesError } = await supabase
        .from("template_exercises")
        .select("name, weight, reps")
        .eq("template_id", templateId);
      if (exercisesError) throw exercisesError;

      const workoutName = `${templateData.name}`;
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({ name: workoutName, user_id: userId })
        .select()
        .single();
      if (workoutError) throw workoutError;

      const exercises = templateExercises.map((ex) => ({
        workout_id: workout.id,
        name: ex.name,
        weight: ex.weight,
        reps: ex.reps,
      }));
      const { error: insertError } = await supabase
        .from("exercises")
        .insert(exercises);
      if (insertError) throw insertError;

      setWorkoutId(workout.id);
    } catch (error) {
      console.error("Error starting workout from template:", error);
      alert("Failed to start workout from template. Please try again.");
    } finally {
      setIsStartingWorkout(false);
    }
  }

  // Save current workout as a template
  async function saveWorkout() {
    const trimmedName = templateName.trim();
    if (!workoutId || !trimmedName) {
      alert("Please start a workout and enter a valid name.");
      return;
    }
    setIsSaving(true);
    try {
      const { data: exercises, error: fetchError } = await supabase
        .from("exercises")
        .select("name, weight, reps")
        .eq("workout_id", workoutId);
      if (fetchError) throw fetchError;

      const { data: template, error: templateError } = await supabase
        .from("templates")
        .insert({ name: trimmedName, user_id: userId })
        .select()
        .single();
      if (templateError) throw templateError;

      const templateExercises = exercises.map((exercise) => ({
        template_id: template.id,
        name: exercise.name,
        weight: exercise.weight,
        reps: exercise.reps,
      }));
      const { error: exercisesError } = await supabase
        .from("template_exercises")
        .insert(templateExercises);
      if (exercisesError) throw exercisesError;

      setTemplates([...templates, { id: template.id, name: trimmedName }]);
      setWorkoutId(null);
      setTemplateName("");
      setShowModal(false);
      alert("Workout saved successfully!");
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Failed to save workout. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // Delete a template and its associated exercises
  async function deleteTemplate(templateId: string) {
    try {
      const { error: exercisesError } = await supabase
        .from("template_exercises")
        .delete()
        .eq("template_id", templateId);
      if (exercisesError) throw exercisesError;

      const { error: templateError } = await supabase
        .from("templates")
        .delete()
        .eq("id", templateId);
      if (templateError) throw templateError;

      setTemplates(templates.filter((t) => t.id !== templateId));
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template. Please try again.");
    }
  }

  // Handle ending the workout
  function endWorkout() {
    setShowModal(true);
  }

  // Confirm save and end
  function confirmEndWorkout(shouldSave: boolean) {
    if (shouldSave) {
      saveWorkout();
    } else {
      setWorkoutId(null);
      setExercises([]);
      setTemplateName("");
      setShowModal(false);
    }
  }

  // Open delete confirmation modal
  const openDeleteModal = (template: Template) => {
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const handleDeleteClose = () => {
    setShowDeleteModal(false);
    setTemplateToDelete(null);
  };

  // Confirm delete action
  const handleDeleteConfirm = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete.id);
    }
    setShowDeleteModal(false);
    setTemplateToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main
        className={`max-w-4xl mx-auto p-6 ${
          showModal || showDeleteModal ? "blur-sm" : ""
        }`}
      >
        {!workoutId ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2
              className="text-2xl font-semibold text-gray-800 mb-4 cursor-pointer hover:text-gray-600 transition-colors"
              onClick={() => setShowPreviousWorkouts(!showPreviousWorkouts)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowPreviousWorkouts(!showPreviousWorkouts);
                }
              }}
              role="button"
              tabIndex={0}
            >
              Previous Workouts
            </h2>
            {showPreviousWorkouts && (
              <>
                {templates.length === 0 ? (
                  <p className="text-gray-600 mb-6">
                    No previous workouts saved.
                  </p>
                ) : (
                  <ul className="max-h-96 overflow-y-scroll space-y-3 mb-6">
                    {templates.map((template) => (
                      <TemplateItem
                        key={template.id}
                        template={template}
                        onStart={startFromTemplate}
                        onOpenDeleteModal={openDeleteModal}
                        isStartingWorkout={isStartingWorkout}
                      />
                    ))}
                  </ul>
                )}
              </>
            )}
            <button
              onClick={startWorkout}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors text-lg font-semibold"
              disabled={!userId || isStartingWorkout}
            >
              {isStartingWorkout ? "Starting..." : "Start New Workout"}
            </button>
            <div className="mt-4">
              <Link href="/progress">
                <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-lg font-semibold">
                  View Progress
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6">
            <ExerciseLog
              workoutId={workoutId}
              exercises={exercises}
              setExercises={setExercises}
            />
            <RestTimer />
            <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <input
                type="text"
                placeholder="Workout Name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
              <button
                onClick={endWorkout}
                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold"
              >
                End Workout
              </button>
            </div>
          </div>
        )}
      </main>
      {/* End Workout Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Would you like to save this workout?
            </h3>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => confirmEndWorkout(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                No
              </button>
              <button
                onClick={() => confirmEndWorkout(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && templateToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleDeleteClose}
          onConfirm={handleDeleteConfirm}
          templateName={templateToDelete.name}
        />
      )}
    </div>
  );
}
