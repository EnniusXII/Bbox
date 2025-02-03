import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';

export function setGridFS(req, res, next) {
  if (!req.gfs) {
    req.gfs = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'greenCards', // Specify the bucket name
    });
  }
  next();
}