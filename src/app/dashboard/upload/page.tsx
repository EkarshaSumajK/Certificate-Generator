export default function UploadPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Upload CSV File</h1>
        <p className="text-muted-foreground mb-8">
          Upload a CSV file containing recipient data to generate multiple certificates.
        </p>
        
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-semibold mb-2">CSV Upload Coming Soon</h3>
          <p className="text-muted-foreground">
            This feature will allow you to upload CSV files and generate certificates in bulk.
          </p>
        </div>
      </div>
    </div>
  );
}
