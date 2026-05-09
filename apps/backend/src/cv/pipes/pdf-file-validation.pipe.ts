import { Injectable, BadRequestException } from '@nestjs/common'
import { PipeTransform } from '@nestjs/common'

@Injectable()
export class PdfFileValidationPipe implements PipeTransform {
  transform(
    file: Express.Multer.File | undefined,
  ): Express.Multer.File {
    if (!file) {
      throw new BadRequestException(
        'A PDF file is required. Please upload your CV.',
      )
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        `Invalid file type: "${file.mimetype}". Only PDF files are accepted.`,
      )
    }

    if (file.size === 0) {
      throw new BadRequestException(
        'The uploaded file is empty. Please upload a valid PDF.',
      )
    }

    return file
  }
}
