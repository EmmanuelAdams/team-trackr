import { NextFunction, Request, Response } from 'express';
import { Task } from '../models/Task';
import { Comment } from '../models/Comment';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middlewares/async';
import { statusCode } from '../statusCodes';

export const getAllComments = asyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    res
      .status(statusCode.success)
      .json(res.advancedResults);
  }
);

export const getComment = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const comment = await Comment.findById(
        req.params.id
      ).populate({
        path: 'task',
        select: 'title description',
      });

      if (!comment) {
        return next(
          new ErrorResponse(
            'Comment not found',
            statusCode.notFound
          )
        );
      }

      res.status(statusCode.success).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      console.error('Error getting comment:', error);
      return next(
        new ErrorResponse(
          'Failed to get single comment',
          statusCode.unprocessable
        )
      );
    }
  }
);

export const postComment = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      req.body.task = req.params.taskId;
      req.body.createdBy = req.user?._id;

      const task = await Task.findById(req.params.taskId);

      if (!task) {
        return next(
          new ErrorResponse(
            `No task with the id of ${req.params.taskId}`,
            statusCode.notFound
          )
        );
      }

      const comment = await Comment.create(req.body);

      res.status(statusCode.created).json({
        success: true,
        data: comment,
        message: 'Comment created successfully',
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      return next(
        new ErrorResponse(
          'Failed to post comment',
          statusCode.unprocessable
        )
      );
    }
  }
);

export const updateComment = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let comment = await Comment.findById(req.params.id);

      if (!comment) {
        return next(
          new ErrorResponse(
            'Comment not found',
            statusCode.notFound
          )
        );
      }

      if (comment.createdBy.toString() !== req.user?._id) {
        return next(
          new ErrorResponse(
            `Not authorized to perform this action`,
            statusCode.forbidden
          )
        );
      }

      comment = await Comment.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!comment) {
        return next(
          new ErrorResponse(
            'Comment not found',
            statusCode.notFound
          )
        );
      }

      await comment.save();

      return res.status(statusCode.success).json({
        success: true,
        comment: comment,
        message: 'Comment updated successfully',
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      return next(
        new ErrorResponse(
          'Failed to update comment',
          statusCode.unprocessable
        )
      );
    }
  }
);

export const deleteComment = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const comment = await Comment.findById(req.params.id);

      if (!comment) {
        return next(
          new ErrorResponse(
            'Comment not found',
            statusCode.notFound
          )
        );
      }

      if (comment.createdBy.toString() !== req.user?._id) {
        return next(
          new ErrorResponse(
            `Not authorized to perform this action`,
            statusCode.forbidden
          )
        );
      }

      await comment.deleteOne();

      res.status(statusCode.success).json({
        success: true,
        data: {},
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      return next(
        new ErrorResponse(
          'Failed to delete comment',
          statusCode.unprocessable
        )
      );
    }
  }
);
