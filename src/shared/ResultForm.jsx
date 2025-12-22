import React from "react";

export function ResultForm({
  students,
  subjects,
  defaultValues,
  onSubmit,
  submitting,
}) {
  const [values, setValues] = React.useState(() => ({
    student_id: defaultValues?.student_id ?? "",
    subject_id: defaultValues?.subject_id ?? "",
    exam_date: defaultValues?.exam_date ?? "",
    max_marks: defaultValues?.max_marks ?? 100,
    marks_obtained: defaultValues?.marks_obtained ?? "",
    grade: defaultValues?.grade ?? "",
    remarks: defaultValues?.remarks ?? "",
  }));

  const handle = (k, v) => setValues(prev => ({ ...prev, [k]: v }));

  return (
    <form
      onSubmit={(e)=>{ e.preventDefault(); onSubmit(values); }}
      className="row g-3"
    >
      <div className="col-md-4">
        <label className="form-label">Student</label>
        <select className="form-select" value={values.student_id} required
          onChange={e=>handle("student_id", Number(e.target.value))}>
          <option value="">Select</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name} • {s.class}</option>)}
        </select>
      </div>

      <div className="col-md-4">
        <label className="form-label">Subject</label>
        <select className="form-select" value={values.subject_id} required
          onChange={e=>handle("subject_id", Number(e.target.value))}>
          <option value="">Select</option>
          {subjects.map(su => <option key={su.id} value={su.id}>{su.name} ({su.code})</option>)}
        </select>
      </div>

      <div className="col-md-4">
        <label className="form-label">Exam Date</label>
        <input type="date" className="form-control" value={values.exam_date}
          onChange={e=>handle("exam_date", e.target.value)} />
      </div>

      <div className="col-md-3">
        <label className="form-label">Max Marks</label>
        <input type="number" className="form-control" value={values.max_marks}
          onChange={e=>handle("max_marks", Number(e.target.value))} />
      </div>

      <div className="col-md-3">
        <label className="form-label">Marks Obtained</label>
        <input type="number" className="form-control" value={values.marks_obtained}
          onChange={e=>handle("marks_obtained", Number(e.target.value))} />
      </div>

      <div className="col-md-3">
        <label className="form-label">Grade</label>
        <select className="form-select" value={values.grade}
          onChange={e=>handle("grade", e.target.value)}>
          <option value="">Select</option>
          <option>A</option><option>B</option><option>C</option><option>D</option><option>F</option>
        </select>
      </div>

      <div className="col-md-3">
        <label className="form-label">Remarks</label>
        <input type="text" className="form-control" value={values.remarks}
          onChange={e=>handle("remarks", e.target.value)} />
      </div>

      <div className="col-12 d-flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : "Save Result"}
        </button>
      </div>
    </form>
  );
}
