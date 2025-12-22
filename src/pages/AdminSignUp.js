import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [userId, setUserId] = useState(""); // optional user ID
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        email_confirm_redirect_to: window.location.origin,
        id: userId || undefined, // use custom ID if provided
      });

      if (signUpError) throw signUpError;

      const newUserId = signUpData.user.id;

      const { error: profileError } = await supabase.from("profiles").insert([
        { id: newUserId, role }
      ]);

      if (profileError) throw profileError;

      setSuccess(`User created as ${role}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleCreateUser}>
      <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
      <input type="text" placeholder="User ID (optional)" value={userId} onChange={e => setUserId(e.target.value)} />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>
      <button type="submit">Create User</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </form>
  );
}
