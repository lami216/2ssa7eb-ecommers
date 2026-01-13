import express from "express";
import { createContactRequest, getContactRequest } from "../controllers/contactRequest.controller.js";

const router = express.Router();

router.post("/", createContactRequest);
router.get("/:id", getContactRequest);

export default router;
