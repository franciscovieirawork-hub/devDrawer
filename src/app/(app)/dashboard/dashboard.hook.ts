import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";

interface Planner {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  username: string;
}

type SortBy = "date" | "name";

export const DashboardHook = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [planners, setPlanners] = useState<Planner[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, plannersRes] = await Promise.all([
        fetch("/api/me"),
        fetch("/api/planner"),
      ]);

      if (!userRes.ok) {
        router.push("/login");
        return;
      }

      const userData = await userRes.json();
      const plannersData = await plannersRes.json();

      setUser(userData.user);
      setPlanners(plannersData.planners || []);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (renaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renaming]);

  const sortedPlanners = [...planners].sort((a, b) => {
    if (sortBy === "name") {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/planner/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPlanners((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  }

  async function handleDuplicate(id: string) {
    setDuplicating(id);
    try {
      const res = await fetch(`/api/planner/${id}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPlanners((prev) => [data.planner, ...prev]);
        router.push(`/planner/${data.planner.id}`);
      }
    } finally {
      setDuplicating(null);
    }
  }

  function handleRenameClick(id: string) {
    const planner = planners.find((p) => p.id === id);
    if (planner) {
      setRenaming(id);
      setRenameValue(planner.title);
    }
  }

  async function handleRenameSave(id: string) {
    const newTitle = renameValue.trim();
    if (!newTitle) {
      setRenaming(null);
      return;
    }

    try {
      const res = await fetch(`/api/planner/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlanners((prev) =>
          prev.map((p) => (p.id === id ? { ...p, title: data.planner.title } : p))
        );
      }
    } finally {
      setRenaming(null);
      setRenameValue("");
    }
  }

  function handleCreated(planner: { id: string; title: string }) {
    router.push(`/planner/${planner.id}`);
  }

  return {
    user,
    planners,
    sortBy,
    setSortBy,
    deleting,
    duplicating,
    renaming,
    renameValue,
    renameInputRef,
    loading,
    handleDelete,
    handleDuplicate,
    handleRenameClick,
    handleRenameSave,
    handleCreated,
    setRenaming,
    setRenameValue,
    sortedPlanners,
  };
};
