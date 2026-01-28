import type { Context } from "hono";
import { pool } from "../config/db.js";
import type { Student } from "./students.model.js";
import type { ResultSetHeader } from "mysql2";

// Get all students
export const getStudents = async (c: Context) => {
  try {
    const [rows] = await pool.query<Student[]>("SELECT * FROM students");
    return c.json(rows);
  } catch (error: any) {
    console.error("Error getting students:", error.message);
    return c.json({ message: "Error getting students", error: error.message }, 500);
  }
};

// Create a new student
export const createStudent = async (c: Context) => {
  try {
    const {
      first_name,
      last_name,
      email,
      age,
      course,
      year_level,
      gpa,
      enrollment_status,
    } = await c.req.json<Partial<Student>>();

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return c.json({ message: "first_name, last_name, and email are required" }, 400);
    }

    // Validate year_level
    let level: number | null = null;
    if (year_level !== undefined) {
      level = Number(year_level);
      if (isNaN(level) || level < 1 || level > 4) {
        return c.json({ message: "year_level must be a number between 1 and 4" }, 400);
      }
    }

    // Validate gpa
    let studentGPA: number | null = null;
    if (gpa !== undefined) {
      studentGPA = Number(gpa);
      if (isNaN(studentGPA) || studentGPA < 0 || studentGPA > 4) {
        return c.json({ message: "gpa must be a number between 0 and 4" }, 400);
      }
    }

    // Validate enrollment_status
    const status = enrollment_status ?? "Active";
    if (!["Active", "Inactive"].includes(status)) {
      return c.json({ message: "enrollment_status must be 'Active' or 'Inactive'" }, 400);
    }

    // Check if email already exists
    const [existing] = await pool.query<Student[]>("SELECT * FROM students WHERE email = ?", [email]);
    if (existing.length > 0) {
      return c.json({ message: "Email already exists" }, 400);
    }

    // Format created_at for MySQL DATETIME
    const now = new Date();
    const created_at = now.toISOString().slice(0, 19).replace("T", " ");

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO students
      (first_name, last_name, email, age, course, year_level, gpa, enrollment_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        age ?? null,
        course ?? null,
        level,
        studentGPA,
        status,
        created_at,
      ]
    );

    const [[newStudent]] = await pool.query<Student[]>(
      "SELECT * FROM students WHERE id = ?",
      [result.insertId]
    );

    return c.json(newStudent);
  } catch (error: any) {
    console.error("Error creating student:", error.message);
    return c.json({ message: "Error creating student", error: error.message }, 500);
  }
};

// Update an existing student
export const updateStudent = async (c: Context) => {
  try {
    const id = c.req.param("id");

    const {
      first_name,
      last_name,
      email,
      age,
      course,
      year_level,
      gpa,
      enrollment_status,
    } = await c.req.json<Partial<Student>>();

    await pool.query<ResultSetHeader>(
      `UPDATE students SET
        first_name = ?,
        last_name = ?,
        email = ?,
        age = ?,
        course = ?,
        year_level = ?,
        gpa = ?,
        enrollment_status = ?
      WHERE id = ?`,
      [
        first_name,
        last_name,
        email,
        age ?? null,
        course ?? null,
        year_level ?? null,
        gpa ?? null,
        enrollment_status ?? "Active",
        id,
      ]
    );

    const [[updatedStudent]] = await pool.query<Student[]>(
      "SELECT * FROM students WHERE id = ?",
      [id]
    );

    return c.json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    return c.json({ message: "Error updating student" }, 500);
  }
};

// Delete a student
export const deleteStudent = async (c: Context) => {
  try {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return c.json({ message: "Invalid student ID" }, 400);

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM students WHERE id = ?",
      [id]
    );

    return c.json({ affectedRows: result.affectedRows });
  } catch (error: any) {
    console.error("Error deleting student:", error.message);
    return c.json({ message: "Error deleting student", error: error.message }, 500);
  }
};