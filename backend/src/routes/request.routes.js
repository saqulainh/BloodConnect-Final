import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createRequest, getRequests, updateRequest, deleteRequest } from "../controllers/requestController.js";
import { requestCreationLimiter } from "../middleware/rateLimiter.js";
import { validateBloodRequest } from "../middleware/validate.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

router.route("/")
    .post(protect, requestCreationLimiter, validateBloodRequest, createRequest)
    // Cache live list for 15s
    .get(protect, cacheMiddleware(15), getRequests);

router.route("/:id")
    .put(protect, updateRequest)
    .delete(protect, deleteRequest);

export default router;
