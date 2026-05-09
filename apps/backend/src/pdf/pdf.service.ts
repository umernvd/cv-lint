import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import { extractText } from 'unpdf'

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name)

  async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    try {
      const uint8Array = new Uint8Array(buffer)
      const { text } = await extractText(uint8Array, { mergePages: true })

      let cleaned = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
      cleaned = cleaned.replace(/ {2,}/g, ' ')
      cleaned = cleaned.trim()

      if (cleaned.length < 50) {
        throw new BadRequestException(
          'Could not extract readable text from this PDF. ' +
            'Please upload a standard text-based PDF, not a scanned image or photo.',
        )
      }

      this.logger.debug(
        `PDF text extracted successfully. Length: ${cleaned.length} characters`,
      )

      return cleaned
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error
      }

      this.logger.error('PDF extraction failed', error)
      throw new BadRequestException(
        'Failed to read this PDF file. ' +
          'The file may be corrupted or password-protected. ' +
          'Please try a different PDF.',
      )
    }
  }
}
