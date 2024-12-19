import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("personal");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editNoteId, setEditNoteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    handleGetAllNotes();
  }, []);

  const formatCreatedAt = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const handleGetAllNotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://noteapplicationbackend.onrender.com/api/v1/document/all",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notes.");
      }
      const data = await response.json();
      setNotes(data.message || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while fetching notes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("https://noteapplicationbackend.onrender.com/api/v1/document/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
          category: noteCategory,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Unable to add your note.");
      }

      await handleGetAllNotes();
      closePopup();
    } catch (error) {
      console.log(error);
    }
  };
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("https://noteapplicationbackend.onrender.com/api/v1/document/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          noteId: editNoteId,
          title: noteTitle,
          content: noteContent,
          category: noteCategory,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Unable to update your note.");
      }

      await handleGetAllNotes();
      closePopup();
    } catch (error) {
      console.log(error);
      setError(error.message || "An error occurred while updating the note.");
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const res = await fetch(
        `https://noteapplicationbackend.onrender.com/api/v1/document/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Unable to delete the note.");
      }

      await handleGetAllNotes();
    } catch (error) {
      console.log(error);
      setError(error.message || "An error occurred while deleting the note.");
    }
  };

  const handleEditNote = (note) => {
    setEditNoteId(note._id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteCategory(note.category);
    setShowPopup(true);
  };


  const closePopup = () => {
    setShowPopup(false);
    setEditNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteCategory("personal");
    setError("");
  };
  const filteredNotes =
    filterCategory === "all"
      ? notes
      : notes.filter((note) => note.category === filterCategory);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Your Notes</h1>
        <Link
          to={"/profile"}
          className=" bg-yellow-300 text-black font-semibold p-3 rounded-lg"
        >
          Profile
        </Link>
      </header>

      <main className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
          <h2 className="text-2xl font-semibold mb-4 sm:mb-0">My Notes</h2>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            onClick={() => setShowPopup(true)}
          >
            Add Note
          </button>
        </div>
        <div className="mb-4">
          <label
            htmlFor="filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Filter by Category
          </label>
          <select
            id="filter"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All</option>
            <option value="personal">personal</option>
            <option value="work">work</option>
            <option value="other">other</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-center text-gray-500">Loading notes...</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white p-4 shadow rounded border border-gray-200"
                >
                  <h3 className="text-lg font-bold mb-2">{note.title}</h3>
                  <p className="text-gray-700 mb-2">{note.content}</p>
                  <span className="text-sm text-gray-500">
                    Category: {note.category}
                  </span>
                  <p>{formatCreatedAt(note.createdAt)}</p>
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      className="py-1 px-3 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      onClick={() => handleEditNote(note)}
                    >
                      Edit
                    </button>
                    <button
                      className="py-1 px-3 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleDeleteNote(note._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-full">
                No notes available.
              </p>
            )}
          </div>
        )}
      </main>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editNoteId ? "Edit Note" : "Add Note"}
            </h2>
            <form onSubmit={editNoteId ? handleUpdateNote : handleAddNote}>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter note title"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Content
                </label>
                <textarea
                  id="content"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter note content"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value)}
                  required
                >
                  <option value="personal">personal</option>
                  <option value="work">work</option>
                  <option value="other">other</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="py-2 px-4 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={closePopup}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {editNoteId ? "Update Note" : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
