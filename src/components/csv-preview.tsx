"use client";

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, Eye, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCSVStore, useCSVData, useCSVCurrentPage, useCSVRowsPerPage, useCSVTotalPages } from '@/stores/csv-store';
import { CSVParserService } from '@/lib/services/csv-parser.service';

interface CSVPreviewProps {
  className?: string;
  showStats?: boolean;
  maxDisplayColumns?: number;
}

export function CSVPreview({ 
  className = "",
  showStats = true,
  maxDisplayColumns = 8
}: CSVPreviewProps) {
  const csvData = useCSVData();
  const currentPage = useCSVCurrentPage();
  const rowsPerPage = useCSVRowsPerPage();
  const totalPages = useCSVTotalPages();
  const { setPagination } = useCSVStore();

  // Calculate current page data with useMemo to prevent unnecessary recalculations
  const currentPageData = useMemo(() => {
    if (!csvData) return [];
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return csvData.rows.slice(startIndex, endIndex);
  }, [csvData, currentPage, rowsPerPage]);

  if (!csvData) {
    return (
      <div className={`flex items-center justify-center p-8 border border-dashed border-border rounded-lg ${className}`}>
        <div className="text-center space-y-2">
          <Eye className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">No CSV data to preview</p>
          <p className="text-sm text-muted-foreground">Upload a CSV file to see the preview here</p>
        </div>
      </div>
    );
  }


  const stats = showStats ? CSVParserService.generateStats(csvData) : null;
  
  // Limit displayed columns for better UI
  const displayHeaders = csvData.headers.slice(0, maxDisplayColumns);
  const hasMoreColumns = csvData.headers.length > maxDisplayColumns;

  const handlePageChange = (newPage: number) => {
    setPagination(newPage, rowsPerPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setPagination(1, newRowsPerPage);
  };

  const handleExport = () => {
    const csvContent = CSVParserService.exportToCSV(csvData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', csvData.fileName.replace(/\.[^/.]+$/, '_processed.csv'));
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with file info and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">CSV Preview</h3>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>📄 {csvData.fileName}</span>
            <span>📊 {csvData.totalRows} rows</span>
            <span>📋 {csvData.headers.length} columns</span>
            <span>📦 {(csvData.fileSize / 1024).toFixed(1)} KB</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && showStats && (
        <Alert>
          <BarChart3 className="h-4 w-4" />
          <AlertDescription>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Rows:</span> {stats.totalRows}
              </div>
              <div>
                <span className="font-medium">Columns:</span> {stats.totalColumns}
              </div>
              <div>
                <span className="font-medium">Empty Rows:</span> {stats.emptyRows}
              </div>
              <div>
                <span className="font-medium">Duplicates:</span> {stats.duplicateRows}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Column overflow warning */}
      {hasMoreColumns && (
        <Alert>
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="text-sm">
                Showing {maxDisplayColumns} of {csvData.headers.length} columns. 
                All data is preserved for processing.
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => console.log('Show all columns - implement modal/sheet')}
              >
                View All Columns
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Data Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16 text-center">#</TableHead>
                {displayHeaders.map((header, index) => (
                  <TableHead key={index} className="font-semibold">
                    <div className="flex flex-col">
                      <span>{header}</span>
                      {stats && (
                        <span className="text-xs text-muted-foreground font-normal">
                          {stats.columnStats[header]?.dataType}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                {hasMoreColumns && (
                  <TableHead className="text-muted-foreground">
                    +{csvData.headers.length - maxDisplayColumns} more...
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={displayHeaders.length + 1 + (hasMoreColumns ? 1 : 0)} 
                    className="text-center py-8 text-muted-foreground"
                  >
                    No data to display
                  </TableCell>
                </TableRow>
              ) : (
                currentPageData.map((row, rowIndex) => (
                  <TableRow key={`row-${rowIndex}`}>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {(currentPage - 1) * rowsPerPage + rowIndex + 1}
                    </TableCell>
                    {displayHeaders.map((header, colIndex) => (
                      <TableCell key={colIndex} className="max-w-xs">
                        <div className="truncate" title={String(row[header] || '')}>
                          {String(row[header] || '')}
                        </div>
                      </TableCell>
                    ))}
                    {hasMoreColumns && (
                      <TableCell className="text-muted-foreground text-sm">
                        ...
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="border border-border rounded px-2 py-1 bg-background"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} 
              ({csvData.totalRows} total rows)
            </span>
            
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
