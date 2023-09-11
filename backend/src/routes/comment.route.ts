import express from "express";
import {
  getAllComments,
  getComment,
  postComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller";
import advancedResults from "../middlewares/advancedResults";
import authenticate from "../middlewares/authentication";

import { Comment } from "../models/Comment";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    advancedResults(Comment), 
    getAllComments 
  )
  .post(authenticate, postComment);

router
  .route("/:id")
  .get(getComment)
  .put(authenticate, updateComment)
  .delete(authenticate, deleteComment);

export default router;
