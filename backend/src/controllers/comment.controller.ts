import { NextFunction, Request, Response } from "express";
import { Task } from "../models/Task";
import { Comment } from "../models/Comment";
import ErrorResponse from "../utils/errorResponse";
import asyncHandler from "../middlewares/async";


export const getAllComments = asyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    try {
      if (req.params.taskId) {
        const comments = await Comment.find({ task: req.params.taskId });

        return res.status(200).json({
          success: true,
          count: comments.length,
          data: comments,
        });
      } else {  
        res.status(200).json(res.advancedResults);
      }
    } catch (error) {
      console.error("Error getting comments:", error);
      return next(new ErrorResponse("Failed to get comments", 422));
    }
  }
);

export const getComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await Comment.findById(req.params.id).populate({
        path: "task",
        select: "name description",
      });

      if (!comment) {
        return next(
          new ErrorResponse(
            `No comment found with the id of ${req.params.id}`,
            404
          )
        );
      }

      res.status(200).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      console.error("Error getting comment:", error);
      return next(new ErrorResponse("Failed to get single comment", 422));
    }
  }
);

export const postComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.task = req.params.taskId;
      req.body.createdBy = req.user?._id;

      const task = await Task.findById(req.params.taskId);

      if (!task) {
        return next(
          new ErrorResponse(`No task with the id of ${req.params.taskId}`, 404)
        );
      }
 
      const comment = await Comment.create(req.body);

      res.status(201).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      return next(new ErrorResponse("Failed to post comment", 422));
    }
  }
);

export const updateComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let comment = await Comment.findById(req.params.id);

      if (!comment) {
        return next(
          new ErrorResponse(`No comment with the id of ${req.params.id}`, 404)
        );
      }

      if (comment.createdBy.toString() !== req.user?._id) {
        return next(new ErrorResponse(`Not authorized to update comment`, 401));
      }

      comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!comment) {
        return next(
          new ErrorResponse(`No comment with the id of ${req.params.id}`, 404)
        );
      }

      await comment.save();

      return res.status(200).json({
        success: true,
        comment: comment,
        message: "Comment updated successfully",
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      return next(new ErrorResponse("Failed to update comment", 422));
    }
  }
);

export const deleteComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await Comment.findById(req.params.id);

      if (!comment) {
        return next(
          new ErrorResponse(`No comment with the id of ${req.params.id}`, 404)
        );
      }

      if (comment.createdBy.toString() !== req.user?._id) {
        return next(new ErrorResponse(`Not authorized to delete comment`, 401));
      }

      await comment.deleteOne();

      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      return next(new ErrorResponse("Failed to delete comment", 422));
    }
  }
);
