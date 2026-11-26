import { describe, expect, it } from 'vitest';
import { MAX_RECEIPT_BYTES, receiptProblem } from './ReceiptDrop';

const file = (name: string, type: string, size = 1000) => ({ name, type, size }) as File;

describe('receipt file check', () => {
  it('accepts screenshots and PDFs', () => {
    expect(receiptProblem(file('chek.jpg', 'image/jpeg'))).toBeNull();
    expect(receiptProblem(file('chek.png', 'image/png'))).toBeNull();
    expect(receiptProblem(file('chek.pdf', 'application/pdf'))).toBeNull();
    expect(receiptProblem(file('IMG_1.HEIC', ''))).toBeNull(); // some phones send no MIME type
  });
  it('rejects other files and anything over 10 MB', () => {
    expect(receiptProblem(file('chek.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))).toMatch(/rasm/);
    expect(receiptProblem(file('katta.jpg', 'image/jpeg', MAX_RECEIPT_BYTES + 1))).toMatch(/10 MB/);
  });
});
