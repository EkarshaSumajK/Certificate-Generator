"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WorkflowProgress } from "@/components/workflow-progress";
import { useCSVData } from "@/stores/csv-store";
import { useCurrentTemplate } from "@/stores/template-store";
import { ArrowRight, FileSpreadsheet, ImageIcon, Settings, CheckCircle } from "lucide-react";

export default function DashboardHome() {
  const { user } = useUser();
  const csvData = useCSVData();
  const template = useCurrentTemplate();

  // Determine current step and completed steps
  const completedSteps: ('csv' | 'template' | 'editor')[] = [];
  if (csvData) completedSteps.push('csv');
  if (template) completedSteps.push('template');

  const currentStep = !csvData ? 'csv' : !template ? 'template' : 'editor';
  
  // Get next action based on workflow state
  const getNextAction = () => {
    if (!csvData) {
      return {
        title: "Start by uploading your CSV data",
        description: "Upload a CSV file containing recipient information",
        href: "/dashboard/upload-csv",
        buttonText: "Upload CSV Data",
        icon: <FileSpreadsheet className="w-5 h-5" />
      };
    } else if (!template) {
      return {
        title: "Next, upload your certificate template",
        description: "Upload the background image for your certificates",
        href: "/dashboard/upload-template",
        buttonText: "Upload Template",
        icon: <ImageIcon className="w-5 h-5" />
      };
    } else {
      return {
        title: "Ready to create certificates!",
        description: "Generate beautiful certificates with your data and template",
        href: "/dashboard/create",
        buttonText: "Create Certificates",
        icon: <Settings className="w-5 h-5" />
      };
    }
  };

  const nextAction = getNextAction();

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome back, {user?.firstName || "User"}! 👋
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Follow the steps below to create beautiful certificates for your recipients.
          </p>
        </div>

        {/* Workflow Progress */}
        <div className="mb-12">
          <WorkflowProgress 
            currentStep={currentStep}
            completedSteps={completedSteps}
            className="max-w-4xl mx-auto"
          />
        </div>

        {/* Next Step Action */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="p-8 border-2 border-primary/20 rounded-lg bg-primary/5 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  {nextAction.icon}
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">{nextAction.title}</h2>
              <p className="text-muted-foreground mb-6">{nextAction.description}</p>
              <Link href={nextAction.href}>
                <Button size="lg" className="px-8">
                  {nextAction.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-center mb-6 text-muted-foreground">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group">
              <div className={`p-6 border rounded-lg bg-card hover:shadow-lg transition-all duration-200 relative ${
                csvData ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-border hover:border-primary/50'
              }`}>
                {csvData && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                  <FileSpreadsheet className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-center mb-2">CSV Data</h4>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {csvData ? `${csvData.totalRows} recipients loaded` : 'Upload recipient data'}
                </p>
                <div className="text-center">
                  <Link href="/dashboard/upload-csv">
                    <Button size="sm" variant={csvData ? "outline" : "default"} className="w-full">
                      {csvData ? 'Update CSV' : 'Upload CSV'}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="group">
              <div className={`p-6 border rounded-lg bg-card hover:shadow-lg transition-all duration-200 relative ${
                template ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-border hover:border-primary/50'
              }`}>
                {template && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-center mb-2">Template</h4>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {template ? `"${template.name}" ready` : 'Upload certificate template'}
                </p>
                <div className="text-center">
                  <Link href="/dashboard/upload-template">
                    <Button size="sm" variant={template ? "outline" : "default"} className="w-full">
                      {template ? 'Update Template' : 'Upload Template'}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="group">
              <div className={`p-6 border rounded-lg bg-card hover:shadow-lg transition-all duration-200 ${
                csvData && template ? 'border-primary hover:border-primary/70' : 'border-border hover:border-primary/50'
              }`}>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-center mb-2">Create Certificates</h4>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {csvData && template ? 'Ready to generate certificates' : 'Complete steps 1 & 2 first'}
                </p>
                <div className="text-center">
                  <Link href="/dashboard/create">
                    <Button 
                      size="sm" 
                      variant={csvData && template ? "default" : "outline"}
                      className="w-full"
                      disabled={!csvData || !template}
                    >
                      Create Certificates
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats or Recent Activity */}
        <div className="bg-muted/30 rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-4">Quick Start Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📁</div>
              <h4 className="font-semibold mb-2">Prepare Your Data</h4>
              <p className="text-sm text-muted-foreground">
                Ensure your CSV has columns like Name, Course, Date, etc.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎨</div>
              <h4 className="font-semibold mb-2">Choose a Template</h4>
              <p className="text-sm text-muted-foreground">
                Select from our pre-designed templates or create your own.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold mb-2">Generate & Download</h4>
              <p className="text-sm text-muted-foreground">
                Generate certificates instantly and download them as PDFs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
