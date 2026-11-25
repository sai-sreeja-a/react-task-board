
import { Router } from "express";
import {
  addProject,
  fetchProjects,
  fetchProjectById,
  editProject,
  removeProject,
  addMember,
  changeMemberRole,
  removeMember,
  fetchProjectMembers
} from "../controllers/projectController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

// All project endpoints require authentication
router.use(requireAuth);
// GET ALL USER PROJECTS
router.get("/", fetchProjects);
// CREATE PROJECT
router.post("/", addProject);
// GET PROJECT BY ID
router.get("/:id", fetchProjectById);
// UPDATE PROJECT (OWNER ONLY)
router.put("/:id", editProject);

// DELETE PROJECT (OWNER ONLY)
router.delete("/:id", removeProject);
// GET PROJECT MEMBERS
router.get("/:id/members", fetchProjectMembers);
// ADD PROJECT MEMBER (OWNER ONLY)
router.post("/:id/members", addMember);

// CHANGE MEMBER ROLE (OWNER ONLY)
router.patch("/:id/members/:memberId", changeMemberRole);

// REMOVE PROJECT MEMBER (OWNER ONLY)
router.delete("/:id/members/:memberId", removeMember);



export default router;
