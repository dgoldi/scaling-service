declare module 'express-fileupload' {
  import { Request, Response, NextFunction } from 'express';

  interface UploadedFile {
    name: string;
    mv: (path: string, callback: (err?: Error) => void) => void;
    encoding: string;
    mimetype: string;
    data: Buffer;
    tempFilePath: string;
    truncated: boolean;
    size: number;
    md5: string;
  }

  // This is exported but only used internally in this declaration file
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface FileArray {
    [fieldname: string]: UploadedFile | UploadedFile[];
  }

  interface Options {
    limits?: {
      fileSize?: number;
    };
    abortOnLimit?: boolean;
    useTempFiles?: boolean;
    tempFileDir?: string;
    debug?: boolean;
    safeFileNames?: boolean;
    preserveExtension?: boolean | number;
    createParentPath?: boolean;
  }

  function fileUpload(options?: Options): (req: Request, res: Response, next: NextFunction) => void;

  namespace fileUpload {
    const limits: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      FileUploadError: any;
    };
  }

  export = fileUpload;
}
