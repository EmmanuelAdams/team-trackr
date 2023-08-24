import { Request, Response, NextFunction } from 'express';
import { Model} from 'mongoose';
import { TaskDocument } from '../models/Task';



// Define an interface to extend the Response type
interface CustomResponse extends Response {
    advancedResults?: {
      success: boolean;
      count: number;
      pagination?: {
        next?: { page: number; limit: number };
        prev?: { page: number; limit: number };
      };
      data: any;
    };
  }


const advancedResults = (model: Model<TaskDocument>, populate?: string) => async (
  req: Request,
  res: CustomResponse, // Use the custom interface here
  next: NextFunction
) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  // Finding resource
  query = model.find(JSON.parse(queryStr));

//   // Select Fields
//   if (req.query.select) {
//     const fields = req.query.select.split(',').join(' ');
//     query = query.select(fields);
//   }

//   // Sort
//   if (req.query.sort) {
//     const sortBy = req.query.sort.split(',').join(' ');
//     query = query.sort(sortBy);
//   } else {
//     query = query.sort('-createdAt');
//   }


//   query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  // Executing query
  const results = await query;





//   if (startIndex > 0) {
//     pagination.prev = {
//       page: page - 1,
//       limit,
//     };
//   }

  res.advancedResults = {
    success: true,
    count: results.length,
    // pagination,
    data: results,
  };

  next();
};

export default advancedResults;
