import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createRequest, getRequests, updateRequest, deleteRequest } from "../controllers/requestController.js";

const router = express.Router();

router.route("/")
    .post(protect, createRequest)
    .get(protect, getRequests);

router.route("/:id")
    .put(protect, updateRequest)
    .delete(protect, deleteRequest);

export default router;
