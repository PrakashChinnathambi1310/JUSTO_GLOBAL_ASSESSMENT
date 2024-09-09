import { Router } from "express";
import {
  generateLink,
  kickout,
  login,
  time,
  magicTokenVerify,
} from "../controllers/app.controller.js";
const router = Router();


// login
router.post("/login", login);

// one time login link
router.post("/magiclink", generateLink);

router.get("/loginbylink/:token", magicTokenVerify);

// get time 
router.get("/time", time);

// kickout
router.get("/kickout/:username", kickout);

export default router;
