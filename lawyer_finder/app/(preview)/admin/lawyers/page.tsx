"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Lawyer {
  id: string;
  name: string;
  location: string;
  experience: string;
  languages: string;
  practiceAreas: string;
  court: string;
  profileLink: string;
}

export default function AdminLawyers() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    experience: "",
    languages: "",
    practiceAreas: "",
    court: "",
    profileLink: "",
    about: ""
  });

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/lawyer/list");
      const data = await res.json();
      if (data.lawyers) {
        setLawyers(data.lawyers);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load lawyers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lawyer?")) return;
    try {
      const res = await fetch(`/api/lawyer/delete?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Lawyer deleted securely!");
        fetchLawyers();
      } else {
        toast.error("Error deleting lawyer");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/lawyer/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Lawyer created and embedded successfully!");
        setFormData({ name: "", location: "", experience: "", languages: "", practiceAreas: "", court: "", profileLink: "", about: "" });
        fetchLawyers();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to create lawyer.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Admin: Lawyer Contacts</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Panel */}
        <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 col-span-1">
          <h2 className="text-xl font-semibold mb-4 dark:text-neutral-200">Add New Lawyer</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <Label>Location</Label>
              <Input name="location" value={formData.location} onChange={handleChange} />
            </div>
            <div>
              <Label>Experience (Years)</Label>
              <Input name="experience" value={formData.experience} onChange={handleChange} />
            </div>
            <div>
              <Label>Languages</Label>
              <Input name="languages" value={formData.languages} onChange={handleChange} />
            </div>
            <div>
              <Label>Practice Areas</Label>
              <Input name="practiceAreas" value={formData.practiceAreas} onChange={handleChange} />
            </div>
            <div>
              <Label>Court</Label>
              <Input name="court" value={formData.court} onChange={handleChange} />
            </div>
            <div>
              <Label>Profile URL</Label>
              <Input name="profileLink" value={formData.profileLink} onChange={handleChange} />
            </div>
            <div>
              <Label>About</Label>
              <textarea 
                name="about" 
                value={formData.about} 
                onChange={handleChange}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full">Create & Embed</Button>
          </form>
        </div>

        {/* List Panel */}
        <div className="col-span-2">
          {loading ? (
            <p className="dark:text-white">Loading lawyers...</p>
          ) : lawyers.length === 0 ? (
            <p className="dark:text-neutral-400">No lawyers found. Add one manually or run the import script.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm">
              <table className="w-full text-sm text-left text-neutral-500 dark:text-neutral-400">
                <thead className="text-xs text-neutral-700 uppercase bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-400">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Practice Areas</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lawyers.map((lw) => (
                    <tr key={lw.id} className="border-b dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{lw.name}</td>
                      <td className="px-4 py-3">{lw.location || 'N/A'}</td>
                      <td className="px-4 py-3">{lw.practiceAreas || 'N/A'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(lw.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
