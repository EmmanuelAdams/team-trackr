import { Request, Response, NextFunction } from 'express';

interface CustomResponse extends Response {
  advancedResults?: any;
}

const advancedResults =
  (model: any, populate?: any) =>
  async (
    req: Request,
    res: CustomResponse,
    next: NextFunction
  ) => {
    let query;

    const reqQuery = { ...req.query };

    const removeFields = [
      'select',
      'sort',
      'page',
      'limit',
    ];

    removeFields.forEach((param) => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);

    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    query = model.find(JSON.parse(queryStr));

    if (req.query.select === 'string') {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    if (typeof req.query.sort === 'string') {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    const page =
      parseInt(req.query.page as string, 10) || 1;
    const limit =
      parseInt(req.query.limit as string, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments(
      JSON.parse(queryStr)
    );

    query = query.skip(startIndex).limit(limit);

    if (populate) {
      query = query.populate(populate);
    }

    const results = await query;

    const pagination: {
      next?: { page: number; limit: number };
      prev?: { page: number; limit: number };
    } = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: results,
    };

    next();
  };

export default advancedResults;
