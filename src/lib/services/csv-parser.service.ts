import * as XLSX from 'xlsx';
import { CSVParseResponse, CSVData, CSVValidationOptions, CSVStats } from '@/lib/types/csv';

/**
 * CSV Parser Service using xlsx library
 * Handles parsing CSV content into structured data with validation and statistics
 */
export class CSVParserService {
  /**
   * Parse CSV text content into structured data
   * @param csvContent - Raw CSV text content
   * @param fileName - Original file name
   * @param fileSize - File size in bytes
   * @param options - Validation options
   * @returns Promise with parsed CSV data or error
   */
  public static async parseCSVContent(
    csvContent: string,
    fileName: string,
    fileSize: number,
    options: CSVValidationOptions = {}
  ): Promise<CSVParseResponse> {
    try {
      // Validate input
      if (!csvContent || csvContent.trim().length === 0) {
        return {
          success: false,
          error: 'CSV content is empty',
          details: 'The uploaded file appears to be empty or contains no readable data.',
        };
      }

      // Parse CSV using xlsx
      const workbook = XLSX.read(csvContent, {
        type: 'string',
        raw: false, // Parse dates and numbers
        dateNF: 'yyyy-mm-dd', // Date format
      });

      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        return {
          success: false,
          error: 'No data found in file',
          details: 'The file does not contain any readable worksheets.',
        };
      }

      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Use first row as headers
        defval: '', // Default value for empty cells
        blankrows: false, // Skip blank rows
      }) as any[][];

      if (jsonData.length === 0) {
        return {
          success: false,
          error: 'No data rows found',
          details: 'The file does not contain any data rows.',
        };
      }

      // Extract headers from first row
      const headers = jsonData[0]?.map((header: any) => 
        String(header || '').trim()
      ).filter(Boolean) || [];

      if (headers.length === 0) {
        return {
          success: false,
          error: 'No headers found',
          details: 'The file must contain at least one header column.',
        };
      }

      // Convert remaining rows to objects
      const dataRows = jsonData.slice(1);
      const rows = dataRows.map((row, index) => {
        const rowObj: Record<string, any> = {};
        
        headers.forEach((header, colIndex) => {
          const cellValue = row[colIndex];
          rowObj[header] = cellValue !== undefined ? cellValue : '';
        });
        
        // Add row metadata
        rowObj._rowIndex = index + 2; // +2 because we skip header and arrays are 0-indexed
        
        return rowObj;
      }).filter(row => {
        // Remove completely empty rows unless allowed
        const hasData = headers.some(header => {
          const value = row[header];
          return value !== null && value !== undefined && String(value).trim() !== '';
        });
        
        return options.allowEmptyRows || hasData;
      });

      // Validate against options
      const validationError = this.validateParsedData(headers, rows, options);
      if (validationError) {
        return validationError;
      }

      // Create CSV data object
      const csvData: CSVData = {
        headers,
        rows,
        totalRows: rows.length,
        fileName,
        fileSize,
        uploadedAt: new Date(),
      };

      return {
        success: true,
        data: csvData,
      };

    } catch (error) {
      console.error('CSV parsing error:', error);
      
      return {
        success: false,
        error: 'Failed to parse CSV file',
        details: error instanceof Error ? error.message : 'Unknown parsing error occurred.',
      };
    }
  }

  /**
   * Validate parsed CSV data against options
   */
  private static validateParsedData(
    headers: string[],
    rows: Record<string, any>[],
    options: CSVValidationOptions
  ): CSVParseResponse | null {
    // Check required headers
    if (options.requiredHeaders && options.requiredHeaders.length > 0) {
      const missingHeaders = options.requiredHeaders.filter(
        requiredHeader => !headers.includes(requiredHeader)
      );
      
      if (missingHeaders.length > 0) {
        return {
          success: false,
          error: `Missing required headers: ${missingHeaders.join(', ')}`,
          details: `The CSV file must contain the following headers: ${options.requiredHeaders.join(', ')}`,
        };
      }
    }

    // Check minimum rows
    if (options.minRows && rows.length < options.minRows) {
      return {
        success: false,
        error: `Insufficient data rows`,
        details: `The file must contain at least ${options.minRows} data rows, but only ${rows.length} were found.`,
      };
    }

    // Check maximum rows
    if (options.maxRows && rows.length > options.maxRows) {
      return {
        success: false,
        error: `Too many data rows`,
        details: `The file contains ${rows.length} rows, but the maximum allowed is ${options.maxRows}.`,
      };
    }

    return null; // No validation errors
  }

  /**
   * Generate statistics for CSV data
   */
  public static generateStats(csvData: CSVData): CSVStats {
    const stats: CSVStats = {
      totalRows: csvData.totalRows,
      totalColumns: csvData.headers.length,
      emptyRows: 0,
      duplicateRows: 0,
      columnStats: {},
    };

    // Initialize column stats
    csvData.headers.forEach(header => {
      stats.columnStats[header] = {
        emptyValues: 0,
        uniqueValues: 0,
        dataType: 'string',
      };
    });

    const uniqueRowsSet = new Set<string>();
    const columnValues: Record<string, Set<any>> = {};

    // Initialize unique value tracking
    csvData.headers.forEach(header => {
      columnValues[header] = new Set();
    });

    // Analyze each row
    csvData.rows.forEach(row => {
      let isEmptyRow = true;
      const rowString = JSON.stringify(row);

      // Check for duplicate rows
      if (uniqueRowsSet.has(rowString)) {
        stats.duplicateRows++;
      } else {
        uniqueRowsSet.add(rowString);
      }

      // Analyze each column in the row
      csvData.headers.forEach(header => {
        const value = row[header];
        const stringValue = String(value || '').trim();

        if (stringValue === '') {
          stats.columnStats[header].emptyValues++;
        } else {
          isEmptyRow = false;
          columnValues[header].add(value);
        }
      });

      if (isEmptyRow) {
        stats.emptyRows++;
      }
    });

    // Calculate unique values and data types
    csvData.headers.forEach(header => {
      const uniqueValues = columnValues[header];
      stats.columnStats[header].uniqueValues = uniqueValues.size;

      // Determine data type
      const sampleValues = Array.from(uniqueValues).slice(0, 10);
      stats.columnStats[header].dataType = this.detectDataType(sampleValues);
    });

    return stats;
  }

  /**
   * Detect the primary data type of a column
   */
  private static detectDataType(values: any[]): 'string' | 'number' | 'date' | 'mixed' {
    if (values.length === 0) return 'string';

    let numberCount = 0;
    let dateCount = 0;
    let stringCount = 0;

    values.forEach(value => {
      const stringValue = String(value).trim();
      
      if (stringValue === '') return;

      // Check if it's a number
      if (!isNaN(Number(stringValue)) && isFinite(Number(stringValue))) {
        numberCount++;
      }
      // Check if it's a date
      else if (!isNaN(Date.parse(stringValue))) {
        dateCount++;
      }
      // Otherwise it's a string
      else {
        stringCount++;
      }
    });

    const total = numberCount + dateCount + stringCount;
    if (total === 0) return 'string';

    // Determine primary type (>= 80% threshold)
    if (numberCount / total >= 0.8) return 'number';
    if (dateCount / total >= 0.8) return 'date';
    if (stringCount / total >= 0.8) return 'string';
    
    return 'mixed';
  }

  /**
   * Export CSV data back to CSV string
   */
  public static exportToCSV(csvData: CSVData): string {
    const worksheet = XLSX.utils.json_to_sheet(csvData.rows, {
      header: csvData.headers,
    });

    return XLSX.utils.sheet_to_csv(worksheet);
  }

  /**
   * Sample data for testing (first N rows)
   */
  public static sampleData(csvData: CSVData, sampleSize: number = 5): CSVData {
    return {
      ...csvData,
      rows: csvData.rows.slice(0, sampleSize),
      totalRows: Math.min(csvData.totalRows, sampleSize),
    };
  }
}
