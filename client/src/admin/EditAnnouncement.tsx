import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, motion } from "framer-motion";

const EditAnnouncement = () => {
  const [isActive, setIsActive] = useState(true);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL;

  // Auto scroll every 3s
  useEffect(() => {
    if (!isActive || messages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [messages, isActive]);

  // Auto save to backend
  const autoSave = async (updatedMessages: string[], updatedActive = isActive) => {
    setMessages(updatedMessages);
    try {
      const res = await fetch(`${API_BASE}/api/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          isActive: updatedActive,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Auto-save failed:", errorText);
      }
    } catch (err) {
      console.error("Auto-save error:", err);
    }
  };

  const handleAddMessage = () => {
    if (text.trim()) {
      const updated = [...messages, text.trim()];
      setText("");
      autoSave(updated);
    }
  };

  const handleRemoveMessage = (index: number) => {
    const updated = [...messages];
    updated.splice(index, 1);
    autoSave(updated);
  };

  const handleEditMessage = (index: number) => {
    setEditingIndex(index);
    setEditText(messages[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editText.trim()) {
      const updated = [...messages];
      updated[editingIndex] = editText.trim();
      setEditingIndex(null);
      setEditText("");
      autoSave(updated);
    }
  };

  const handleToggleActive = (value: boolean) => {
    setIsActive(value);
    autoSave(messages, value);
  };

  // Initial fetch
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        console.log("📦 Fetching announcements from:", `${API_BASE}/api/announcements`);
        const res = await fetch(`${API_BASE}/api/announcements`);
        const contentType = res.headers.get("content-type");

        if (!res.ok || !contentType?.includes("application/json")) {
          const text = await res.text();
          throw new Error(`Bad response: ${text}`);
        }

        const data = await res.json();
        setMessages(data.messages || []);
        setIsActive(data.isActive ?? true);
      } catch (error) {
        console.error("❌ Fetch error:", error);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Announcement Bar</h2>

      <div className="flex items-center justify-between mb-4">
        <label className="text-lg font-medium">Announcement Active:</label>
        <Switch checked={isActive} onCheckedChange={handleToggleActive} />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">Add New Message:</label>
        <Textarea
          rows={2}
          placeholder="Type your message here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <Button
            className="bg-black text-white hover:bg-gray-900"
            onClick={handleAddMessage}
          >
            Add Message
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <p className="font-medium mb-2">Messages:</p>
        <ul className="list-disc list-inside space-y-2">
          {messages.map((msg, index) => (
            <li key={index} className="flex justify-between items-start gap-2">
              {editingIndex === index ? (
                <div className="flex-1">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={1}
                    className="text-sm mb-4"
                  />
                  <div className="mt-1 flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit} className="bg-green-500 text-white">
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingIndex(null)}
                      className="hover:text-white hover:bg-red-600 bg-red-600 text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="flex-1">{msg}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="hover:bg-green-500" onClick={() => handleEditMessage(index)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveMessage(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {isActive && messages.length > 0 && (
        <div className="mt-6">
          <p className="font-medium mb-1">Live Preview (scrolling):</p>
          <div className="relative h-12 overflow-hidden border rounded bg-yellow-400 flex items-center justify-center">
            <div className="relative w-full h-full flex justify-center items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "-100%", opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute font-medium text-black text-center"
                >
                  {messages[currentIndex]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAnnouncement;
