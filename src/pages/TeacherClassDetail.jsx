import { useEffect, useState } from "react";
import { getApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase/firebase";

const functions = getFunctions(getApp(), "europe-west1");

function TeacherClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [members, setMembers] = useState([]);
  const [contentType, setContentType] = useState("program");
  const [contentId, setContentId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadClass = async () => {
    setLoading(true);
    setMessage("");

    try {
      const user = auth.currentUser;

      if (!user) {
        navigate("/login");
        return;
      }

      if (!classId) {
        setMessage("Missing class ID.");
        return;
      }

      // Load class
      const classSnapshot = await getDoc(doc(db, "classes", classId));

      if (!classSnapshot.exists()) {
        setMessage("Class not found.");
        return;
      }

      const loadedClass = {
        id: classSnapshot.id,
        ...classSnapshot.data(),
      };

      // Verify ownership
      if (loadedClass.teacherId !== user.uid) {
        setMessage("You do not have permission to view this class.");
        return;
      }

      // Load members directly from classMembers
const memberSnapshot = await getDocs(
  query(
    collection(db, "classMembers"),
    where("classId", "==", classId),
    where("teacherId", "==", user.uid),
    where("status", "==", "active")
  )
);

      const loadedMembers = memberSnapshot.docs.map((memberDoc) => {
        const data = memberDoc.data();

        return {
          membershipId: memberDoc.id,
          id: data.studentId,
          ...data,
        };
      });

      setClassData(loadedClass);
      setMembers(loadedMembers);
    } catch (error) {
      console.error("Failed to load teacher class:", error);

      if (error?.code === "permission-denied") {
        setMessage("You do not have permission to load this class.");
      } else if (error?.code === "failed-precondition") {
        setMessage(
          "This class query requires a Firestore index. Check the browser console."
        );
      } else {
        setMessage(error?.message || "Could not load this class.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClass();
  }, [classId]);

  const assignContent = async (event) => {
    event.preventDefault();
    setMessage("");

    const trimmedContentId = contentId.trim();

    if (!trimmedContentId) {
      setMessage("Please enter a content ID.");
      return;
    }

    try {
      await httpsCallable(functions, "assignClassContent")({
        classId,
        contentType,
        contentId: trimmedContentId,
      });

      setContentId("");
      setMessage("Content assigned to this class.");
    } catch (error) {
      console.error("Failed to assign class content:", error);
      setMessage(error?.message || "Could not assign content.");
    }
  };

  const removeMember = async (studentId) => {
    setMessage("");

    try {
      await httpsCallable(functions, "removeClassMember")({
        classId,
        studentId,
      });

      setMessage("Student removed from the class.");

      await loadClass();
    } catch (error) {
      console.error("Failed to remove class member:", error);
      setMessage(error?.message || "Could not remove the student.");
    }
  };

  if (loading) {
    return (
      <main className="page-shell">
        Loading class...
      </main>
    );
  }

  if (!classData) {
    return (
      <main
        className="page-shell"
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "32px 20px",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/teacher/classes")}
        >
          Back to classes
        </button>

        <h1>Could not open class</h1>

        <p role="alert">
          {message || "The class could not be loaded."}
        </p>

        <button
          type="button"
          onClick={loadClass}
        >
          Try again
        </button>
      </main>
    );
  }

  return (
    <main
      className="page-shell"
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "32px 20px",
      }}
    >
      <button
        type="button"
        onClick={() => navigate("/teacher/classes")}
      >
        Back to classes
      </button>

      <h1>{classData.name || "Class"}</h1>

      <p>
        Class code:{" "}
        <strong>
          {classData.classCode || "-"}
        </strong>
      </p>

      {classData.grade && (
        <p>
          Grade: <strong>{classData.grade}</strong>
        </p>
      )}

      {classData.learningTrack && (
        <p>
          Learning track:{" "}
          <strong>{classData.learningTrack}</strong>
        </p>
      )}

      {/* Assign content */}
      <section
        className="student-panel"
        style={{ marginTop: 24 }}
      >
        <h2>Assign content</h2>

        <form
          onSubmit={assignContent}
          style={{
            display: "grid",
            gap: 12,
            maxWidth: 520,
          }}
        >
          <label>
            Content type

            <select
              value={contentType}
              onChange={(event) =>
                setContentType(event.target.value)
              }
            >
              <option value="program">
                Program
              </option>

              <option value="lesson">
                Lesson
              </option>
            </select>
          </label>

          <label>
            Content ID

            <input
              value={contentId}
              onChange={(event) =>
                setContentId(event.target.value)
              }
              placeholder="Program or lesson document ID"
              required
            />
          </label>

          <button type="submit">
            Assign to class
          </button>
        </form>
      </section>

      {/* Students */}
      <section
        className="student-panel"
        style={{ marginTop: 24 }}
      >
        <h2>
          Students ({members.length})
        </h2>

        {members.length === 0 ? (
          <p>
            No students have joined this class yet.
          </p>
        ) : (
          members.map((member) => (
            <div
              key={
                member.membershipId ||
                member.id
              }
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom:
                  "1px solid #eee",
              }}
            >
              <div>
                <strong>
                  {member.studentName ||
                    member.name ||
                    member.studentEmail ||
                    member.email ||
                    member.studentId ||
                    member.id}
                </strong>

                {member.studentEmail && (
                  <div
                    style={{
                      fontSize: 14,
                      opacity: 0.7,
                      marginTop: 3,
                    }}
                  >
                    {member.studentEmail}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  removeMember(
                    member.studentId ||
                      member.id
                  )
                }
              >
                Remove
              </button>
            </div>
          ))
        )}
      </section>

      {message && (
        <p
          role="status"
          style={{
            marginTop: 20,
          }}
        >
          {message}
        </p>
      )}
    </main>
  );
}

export default TeacherClassDetail;