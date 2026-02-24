"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown,
  Star,
  ArrowLeft,
  Trophy,
  History,
  GraduationCap,
  X,
  Maximize2
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getScreeningResults } from "@/lib/indexed-db";

interface CandidateAnalysis {
  candidateName: string;
  score: number;
  summary: string;
  pros: string[];
  cons: string[];
  skills: string[];
  experienceYears?: number;
  education?: string;
}

interface ScreeningResult {
  fileName: string;
  success: boolean;
  analysis?: CandidateAnalysis;
  error?: string;
  fileData?: string; // Base64 representation of the PDF
}

import { Suspense } from "react";

// ... existing interfaces ...

function ResultsContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "General Role";
  
  // In a real app, we'd fetch this from a state management tool or database
  // For this demo, we'll try to get it from localStorage or show a placeholder
  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchResults = async () => {
      const storedResults = await getScreeningResults();
      if (storedResults) {
        setResults(storedResults);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin/resume-screening" className="text-sm text-primary flex items-center gap-1 hover:underline mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Upload
          </Link>
          <div className="flex items-center gap-3">
             <h2 className="text-3xl font-bold tracking-tight">Check Results</h2>
             <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-2 py-0.5">
                {role}
             </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            We've analyzed the resumes against the requirements for <strong>{role}</strong>.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-gradient-to-br from-card to-muted/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Trophy className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Best Matches</span>
          </div>
          <CardTitle className="text-2xl">Candidate Scores</CardTitle>
          <CardDescription>
            Candidates ranked by how well they match the {role} job.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="p-3 rounded-full bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  Please go back and upload resumes to see the analysis.
                </p>
                <Button asChild variant="outline" className="mt-4">
                    <Link href="/admin/resume-screening">Go Back</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="border rounded-xl overflow-x-auto bg-background w-full">
              <Table className="w-full">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="font-bold">Candidate</TableHead>
                    <TableHead className="font-bold">Score</TableHead>
                    <TableHead className="hidden lg:table-cell font-bold">Top Skills</TableHead>
                    <TableHead className="text-right font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <React.Fragment key={index}>
                      <TableRow 
                        className={`cursor-pointer transition-all hover:bg-muted/30 ${expandedRow === index ? 'bg-primary/5' : ''}`}
                        onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                      >
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {expandedRow === index ? 
                              <ChevronDown className="h-5 w-5 text-primary animate-in fade-in duration-300" /> : 
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            }
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-base py-4">
                          {result.success ? result.analysis?.candidateName : result.fileName}
                        </TableCell>
                        <TableCell className="min-w-[140px]">
                          {result.success ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden shrink-0">
                                <div 
                                  className={`h-full transition-all duration-1000 ease-out ${
                                    (result.analysis?.score || 0) >= 80 ? "bg-emerald-500" : 
                                    (result.analysis?.score || 0) >= 60 ? "bg-amber-500" : 
                                    "bg-rose-500"
                                  }`}
                                  style={{ width: `${result.analysis?.score}%` }}
                                />
                              </div>
                              <span className={`font-bold text-sm shrink-0 ${
                                (result.analysis?.score || 0) >= 80 ? "text-emerald-600" : 
                                (result.analysis?.score || 0) >= 60 ? "text-amber-600" : "text-rose-600"
                              }`}>{result.analysis?.score}%</span>
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell min-w-[200px]">
                           <div className="flex flex-wrap gap-1.5">
                              {result.analysis?.skills.slice(0, 3).map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px] bg-secondary/50 border-none">{skill}</Badge>
                              ))}
                              {(result.analysis?.skills?.length || 0) > 3 && (
                                <span className="text-[10px] font-bold text-muted-foreground">+{result.analysis!.skills.length - 3}</span>
                              )}
                           </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {result.success ? (
                            <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-emerald-100 text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase">Error</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedRow === index && (
                        <TableRow className="bg-primary/[0.02] animate-in slide-in-from-top-2 duration-300">
                          <TableCell colSpan={5} className="p-0 border-t-0">
                            <div className="p-4 md:p-8 space-y-8 w-full max-w-full overflow-hidden">
                              {result.success ? (
                                <>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                                    <div className="space-y-6">
                                      <div className="bg-background p-5 rounded-2xl border border-primary/10 shadow-sm">
                                          <Star className="h-4 w-4 fill-primary text-primary" /> AI Summary
                                        <p className="text-sm leading-relaxed text-foreground/80 italic whitespace-normal break-words underline-none">"{result.analysis?.summary}"</p>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-muted/30 border border-muted flex items-start gap-3">
                                          <div className="p-2 rounded-lg bg-background text-primary">
                                            <History className="h-4 w-4" />
                                          </div>
                                          <div>
                                            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter shadow-none">Total Experience</h4>
                                            <p className="text-lg font-bold text-foreground">{result.analysis?.experienceYears} Years</p>
                                          </div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-muted/30 border border-muted flex items-start gap-3">
                                          <div className="p-2 rounded-lg bg-background text-primary">
                                            <GraduationCap className="h-4 w-4" />
                                          </div>
                                          <div className="overflow-hidden">
                                            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter shadow-none">Education</h4>
                                            <p className="text-sm font-bold text-foreground truncate" title={result.analysis?.education}>{result.analysis?.education || "N/A"}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                      <div className="space-y-4">
                                        <div className="space-y-3">
                                          <h4 className="text-sm font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Key Strengths
                                          </h4>
                                          <div className="space-y-2">
                                            {result.analysis?.pros.map((pro, i) => (
                                              <div key={i} className="flex gap-3 text-sm group w-full min-w-0">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                                <span className="text-foreground/80 leading-relaxed whitespace-normal break-words flex-1 min-w-0">{pro}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                          
                                          <h4 className="text-sm font-black uppercase tracking-widest text-amber-600 flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-600" /> Areas of Concern
                                          </h4>
                                          <div className="space-y-2">
                                            {result.analysis?.cons.map((con, i) => (
                                              <div key={i} className="flex gap-3 text-sm group w-full min-w-0">
                                                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                                <span className="text-foreground/80 leading-relaxed whitespace-normal break-words flex-1 min-w-0">{con}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                  </div>
                                  
                                  <div className="pt-6 border-t border-muted">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            Skills Found
                                        </h4>
                                        <span className="text-xs text-muted-foreground font-medium">{result.analysis?.skills.length} matching skills identified</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {result.analysis?.skills.map((skill, i) => (
                                        <Badge key={i} variant="outline" className="px-3 py-1 font-semibold text-primary/80 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-3 pt-4">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="rounded-full px-5 border-primary/20 hover:bg-primary/5 text-primary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (result.fileData) {
                                            setViewingPdf(result.fileData);
                                          } else {
                                            toast.error("Original file data is missing. Please re-upload.", {
                                              description: "File data is not persisted after page refresh to save memory."
                                            });
                                          }
                                        }}
                                      >
                                        <Maximize2 className="h-4 w-4 mr-2" />
                                        View Full Resume
                                      </Button>
                                  </div>
                                </>
                              ) : (
                                <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-sm flex items-start gap-4">
                                  <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                                    <AlertCircle className="h-6 w-6" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-base font-black uppercase tracking-tight">Processing Error</p>
                                    <p className="text-rose-700/80 leading-relaxed font-medium">{result.error}</p>
                                    <Button variant="ghost" size="sm" className="mt-2 h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-100 p-0 font-bold border-b border-rose-200">
                                      Retry analysis for this file
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modern PDF Viewer Modal */}
      {viewingPdf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setViewingPdf(null)} />
          <div className="relative w-full max-w-5xl h-full bg-card border border-border shadow-2xl rounded-[32px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-4 md:p-6 border-b flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Original Resume Document</h3>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors" onClick={() => setViewingPdf(null)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 w-full bg-muted/20 relative min-h-[500px]">
              <object 
                data={viewingPdf} 
                type="application/pdf"
                className="w-full h-full border-none rounded-b-[32px]"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-muted-foreground opacity-20" />
                    <div>
                        <p className="font-bold text-lg">Unable to display PDF directly</p>
                        <p className="text-sm text-muted-foreground">Your browser might be blocking the embedded viewer.</p>
                    </div>
                    <Button asChild variant="default" className="rounded-full px-8">
                        <a href={viewingPdf} download="resume.pdf">Download to View</a>
                    </Button>
                </div>
              </object>
            </div>
            <div className="p-4 border-t flex justify-between items-center bg-card">
              <p className="text-xs text-muted-foreground font-medium italic">Secure View</p>
              <div className="flex gap-2">
                <Button variant="ghost" asChild size="sm" className="text-xs font-bold hover:bg-muted rounded-full">
                    <a href={viewingPdf} download="resume.pdf">Download Copy</a>
                </Button>
                <Button variant="secondary" onClick={() => setViewingPdf(null)} className="rounded-full px-8">Close Viewer</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScreeningResultsPage() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="loading-container flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground font-medium">Calibrating Results View...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
