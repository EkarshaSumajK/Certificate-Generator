# File Reader Service & Hook

A comprehensive utility service and React hook for reading files using the browser's FileReader API. Provides promise-based methods with proper error handling, validation, and TypeScript support.

## Features

- ✅ **Promise-based API** - Clean async/await interface
- ✅ **TypeScript Support** - Full type safety and IntelliSense
- ✅ **Error Handling** - Comprehensive error codes and messages
- ✅ **File Validation** - Size limits, type checking, and format validation
- ✅ **React Hook** - State management with loading, progress, and error states
- ✅ **Multiple File Types** - Images, CSV, text files, and binary files
- ✅ **Browser Compatibility** - Checks for FileReader API support
- ✅ **Utility Methods** - File type checking and size formatting

## Quick Start

### Using the Service (Standalone)

```typescript
import { FileReaderService } from '@/lib/services';

// Read an image file
const result = await FileReaderService.readImageAsDataURL(file);
if (result.success) {
  console.log('Image data URL:', result.data);
  console.log('File info:', result.fileName, result.fileSize);
} else {
  console.error('Error:', result.error);
}

// Read a CSV file
const csvResult = await FileReaderService.readCSVAsText(file);
if (csvResult.success) {
  console.log('CSV content:', csvResult.data);
}
```

### Using the React Hook

```typescript
import { useFileReader } from '@/hooks';

function MyComponent() {
  const {
    readImageAsDataURL,
    readCSVAsText,
    isReading,
    error,
    progress,
    reset
  } = useFileReader();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const result = await readImageAsDataURL(file);
    
    if (result.success) {
      // Handle success
      setImageUrl(result.data);
    }
  };

  return (
    <div>
      {isReading && <div>Loading... {progress}%</div>}
      {error && <div>Error: {error}</div>}
      <input type="file" onChange={handleFileUpload} />
    </div>
  );
}
```

### Specialized Hooks

```typescript
// For image-only operations
import { useImageReader } from '@/hooks';

// For CSV-only operations
import { useCSVReader } from '@/hooks';
```

## API Reference

### FileReaderService Methods

#### `readImageAsDataURL(file, options?)`
- **Purpose**: Read image files as base64 data URLs
- **Default limits**: 5MB, JPEG/PNG/GIF/WebP only
- **Returns**: `Promise<FileReadResponse<string>>`

#### `readCSVAsText(file, options?)`
- **Purpose**: Read CSV files as text strings
- **Default limits**: 10MB, CSV/text files only
- **Returns**: `Promise<FileReadResponse<string>>`

#### `readTextFile(file, options?)`
- **Purpose**: Read any text file
- **Default limits**: 50MB, all file types
- **Returns**: `Promise<FileReadResponse<string>>`

#### `readAsArrayBuffer(file, options?)`
- **Purpose**: Read files as binary ArrayBuffer
- **Default limits**: 100MB, all file types
- **Returns**: `Promise<FileReadResponse<ArrayBuffer>>`

### Utility Methods

#### `isImageFile(file)` / `isCSVFile(file)`
Check if a file matches the expected type.

#### `formatFileSize(bytes)`
Format file size in human-readable format (KB, MB, GB).

### Options

```typescript
interface FileReadOptions {
  maxSizeBytes?: number;    // File size limit
  allowedTypes?: string[];  // MIME types allowed
  encoding?: string;        // Text encoding (default: UTF-8)
}
```

### Error Handling

The service provides detailed error information:

```typescript
interface FileReadError {
  success: false;
  error: string;           // Human-readable error message
  code: FileErrorCode;     // Programmatic error code
  fileName?: string;       // Original file name
}

enum FileErrorCode {
  FILE_NOT_PROVIDED = 'FILE_NOT_PROVIDED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  READ_ERROR = 'READ_ERROR',
  UNSUPPORTED_BROWSER = 'UNSUPPORTED_BROWSER',
}
```

## Examples

### Custom Validation

```typescript
// Custom image options
const result = await FileReaderService.readImageAsDataURL(file, {
  maxSizeBytes: 2 * 1024 * 1024, // 2MB limit
  allowedTypes: ['image/jpeg', 'image/png'] // Only JPEG and PNG
});

// Custom CSV options
const csvResult = await FileReaderService.readCSVAsText(file, {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB limit
  encoding: 'UTF-8'
});
```

### Progress Tracking with Hook

```typescript
function FileUploader() {
  const { readCSVAsText, isReading, progress, error } = useFileReader();

  return (
    <div>
      {isReading && (
        <div className="progress-bar">
          <div style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      )}
      
      {error && (
        <div className="error-message">{error}</div>
      )}
    </div>
  );
}
```

### File Type Validation

```typescript
function handleFileSelect(event) {
  const file = event.target.files[0];
  
  if (FileReaderService.isImageFile(file)) {
    // Handle image
    readImageAsDataURL(file);
  } else if (FileReaderService.isCSVFile(file)) {
    // Handle CSV
    readCSVAsText(file);
  } else {
    alert('Unsupported file type');
  }
}
```

## Browser Support

The service automatically checks for FileReader API support and provides appropriate error messages for unsupported browsers. Works in all modern browsers (IE10+).

## Testing

A demo component is available at `src/components/file-reader-demo.tsx` for testing the service functionality.
