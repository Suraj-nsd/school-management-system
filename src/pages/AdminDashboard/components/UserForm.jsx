// src/shared/pages/AdminDashboard/components/UserForm.jsx
import React from "react";
import { Controller } from "react-hook-form";

export default function UserForm({
  handleSubmit,
  control,
  errors,
  isSubmitting,
  onSubmit,
  onCancel,
}) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-3">
        <label htmlFor="username" className="form-label fw-semibold">
          Username
        </label>
        <Controller
          name="username"
          control={control}
          rules={{ required: "Username required" }}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className={`form-control ${
                errors.username ? "is-invalid" : ""
              }`}
              id="username"
              placeholder="Enter username"
            />
          )}
        />
        <div className="invalid-feedback">
          {errors.username?.message}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label fw-semibold">
          Password
        </label>
        <Controller
          name="password"
          control={control}
          rules={{
            required: "Password required",
            minLength: {
              value: 6,
              message: "Min length 6",
            },
          }}
          render={({ field }) => (
            <input
              {...field}
              type="password"
              className={`form-control ${
                errors.password ? "is-invalid" : ""
              }`}
              id="password"
              placeholder="Enter password"
            />
          )}
        />
        <div className="invalid-feedback">
          {errors.password?.message}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="role" className="form-label fw-semibold">
          Role
        </label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <select {...field} className="form-select" id="role">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          )}
        />
      </div>

      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-primary flex-grow-1"
          disabled={isSubmitting}
          style={{
            background: "linear-gradient(135deg, #004aad 0%, #0077ff 70%)",
            borderColor: "transparent",
            borderRadius: 10,
            fontWeight: 600,
          }}
        >
          {isSubmitting ? "Creating…" : "Create User"}
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancel}
          style={{ borderRadius: 10 }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
