import { NextFunction, Request, Response } from 'express';

const checkUserLevelAndType = (
  requiredLevels: string[],
  requiredTypes: string[]
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userLevel = req.user?.level;
    const userType = req.user?.userType;

    if (!userLevel || !userType) {
      return res
        .status(401)
        .json({ message: 'Unauthorized' });
    }

    if (
      !requiredLevels.includes(userLevel) ||
      !requiredTypes.includes(userType)
    ) {
      return res
        .status(403)
        .json({ message: 'Permission denied' });
    }

    next();
  };
};

const checkSeniorOrCEO = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userLevel = req.user?.level;

  if (
    !userLevel ||
    !['Senior', 'CEO'].includes(userLevel)
  ) {
    return res
      .status(403)
      .json({ message: 'Permission denied' });
  }

  next();
};

const checkAssignedUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?._id;

  if (!userId || !req.params.taskId) {
    return res
      .status(401)
      .json({ message: 'Unauthorized' });
  }

  // // Check if the user's ID matches any of the assignedTo IDs
  // Tasks.findById(req.params.taskId)
  //   .then((task: { assignedTo: string | string[]; }) => {
  //     if (!task) {
  //       return res.status(404).json({ message: 'Task not found' });
  //     }

  //     if (!task.assignedTo.includes(userId)) {
  //       return res.status(403).json({ message: 'Permission denied' });
  //     }

  //     next();
  //   })
  //   .catch((error: any) => {
  //     console.error(error);
  //     return res.status(500).json({ message: 'Internal server error' });
  //   });
};
