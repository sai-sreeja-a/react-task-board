
import { Request, Response, NextFunction } from "express";
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
  getProjectMembers,
  ProjectRole
} from "../services/projectService";

// CREATE PROJECT
export const addProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = res.locals.userId;
    const { name, description } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 150
    ) {
      res.status(400).json({
        success: false,
        message: "Project name is required and must not exceed 150 characters"
      });
      return;
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Project description must be a string"
      });
      return;
    }

    const project = await createProject(
      { name, description },
      userId
    );

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project
    });
  } catch (error) {
    next(error);
  }
};



// GET ALL PROJECTS ACCESSIBLE TO THE LOGGED-IN USER
export const fetchProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = res.locals.userId;

    const projects = await getUserProjects(userId);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};


// GET A SINGLE PROJECT
export const fetchProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = Number(req.params.id);
    const userId = res.locals.userId;

    if (!Number.isInteger(projectId) || projectId <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
      return;
    }

    const project = await getProjectById(projectId, userId);

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE PROJECT (OWNER ONLY)
export const editProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = Number(req.params.id);
    const userId = res.locals.userId;
    const { name, description } = req.body;

    if (!Number.isInteger(projectId) || projectId <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
      return;
    }

    if (
      name !== undefined &&
      (typeof name !== "string" || !name.trim() || name.trim().length > 150)
    ) {
      res.status(400).json({
        success: false,
        message: "Project name must be a non-empty string of at most 150 characters"
      });
      return;
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Project description must be a string or null"
      });
      return;
    }

    if (name === undefined && description === undefined) {
      res.status(400).json({
        success: false,
        message: "Provide a project name or description to update"
      });
      return;
    }

    const project = await updateProject(projectId, userId, {
      name,
      description
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found or you are not the owner"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// DELETE PROJECT (OWNER ONLY)
export const removeProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = Number(req.params.id);
    const userId = res.locals.userId;

    if (!Number.isInteger(projectId) || projectId <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
      return;
    }

    const deleted = await deleteProject(projectId, userId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Project not found or you are not the owner"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

const isValidProjectRole = (role: unknown): role is ProjectRole =>
  role === "member" || role === "viewer";

// ADD PROJECT MEMBER (OWNER ONLY)
export const addMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = Number(req.params.id);
    const ownerId = res.locals.userId;
    const { email, role } = req.body;

    if (!Number.isInteger(projectId) || projectId <= 0) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
      return;
    }

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ success: false, message: "Valid email is required" });
      return;
    }

    if (!isValidProjectRole(role)) {
      res.status(400).json({
        success: false,
        message: "Role must be member or viewer"
      });
      return;
    }

    const member = await addProjectMember(projectId, ownerId, email, role);

    if (!member) {
      res.status(404).json({
        success: false,
        message: "Project or user not found, or you are not the owner"
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Project member added successfully",
      data: member
    });
  } catch (error: any) {
    if (error.code === "23505") {
      res.status(409).json({
        success: false,
        message: "This user is already a project member"
      });
      return;
    }
    next(error);
  }
};

// CHANGE MEMBER ROLE (OWNER ONLY)
export const changeMemberRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = Number(req.params.id);
    const memberId = Number(req.params.memberId);
    const ownerId = res.locals.userId;
    const { role } = req.body;

    if (
      !Number.isInteger(projectId) || projectId <= 0 ||
      !Number.isInteger(memberId) || memberId <= 0
    ) {
      res.status(400).json({ success: false, message: "Invalid project or member ID" });
      return;
    }

    if (!isValidProjectRole(role)) {
      res.status(400).json({
        success: false,
        message: "Role must be member or viewer"
      });
      return;
    }

    const member = await updateProjectMemberRole(
      projectId, ownerId, memberId, role
    );

    if (!member) {
      res.status(404).json({
        success: false,
        message: "Project or member not found, or you are not the owner"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      data: member
    });
  } catch (error) {
    next(error);
  }
};

// REMOVE PROJECT MEMBER (OWNER ONLY)
export const removeMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = Number(req.params.id);
    const memberId = Number(req.params.memberId);
    const ownerId = res.locals.userId;

    if (
      !Number.isInteger(projectId) || projectId <= 0 ||
      !Number.isInteger(memberId) || memberId <= 0
    ) {
      res.status(400).json({ success: false, message: "Invalid project or member ID" });
      return;
    }

    const removed = await removeProjectMember(
      projectId, ownerId, memberId
    );

    if (!removed) {
      res.status(404).json({
        success: false,
        message: "Project or member not found, or you are not the owner"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Project member removed successfully"
    });
  } catch (error) {
    next(error);
  }
};

// GET PROJECT MEMBERS
export const fetchProjectMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = Number(req.params.id);
    const userId = res.locals.userId;

    if (!Number.isInteger(projectId) || projectId <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
      return;
    }

    const members = await getProjectMembers(projectId, userId);

    if (members.length === 0) {
      res.status(404).json({
        success: false,
        message: "Project not found or you are not a member"
      });
      return;
    }

    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    next(error);
  }
};

