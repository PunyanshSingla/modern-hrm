"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <Link href="/admin/resume-screening" className="text-xs text-primary font-medium flex items-center gap-1.5 hover:underline mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Upload
          </Link>
          <div className="flex items-center gap-3">
             <h2 className="text-2xl font-bold tracking-tight text-foreground">Screening Analysis Results</h2>
             <Badge variant="outline" className="text-xs font-medium px-2.5 py-0.5 border text-primary border-primary/20 bg-primary/5">
                {role}
             </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-normal">
            Resume evaluation breakdown and match scores for <strong>{role}</strong>.
          </p>
        </div>
      </div>

      <Card className="rounded-xl border border-border shadow-xs bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-1.5 text-primary mb-1">
            <Trophy className="h-4 w-4" />
            <span className="text-xs font-semibold">Candidate Ranking</span>
          </div>
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">Candidate Scores</CardTitle>
          <CardDescription className="text-xs">
            Candidates ranked by how well their experience matches the {role} role requirements.
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
            <div className="border border-border/60 rounded-xl overflow-x-auto custom-scrollbar bg-background w-full">
              <Table className="w-full min-w-[600px]">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="font-semibold text-xs text-muted-foreground w-1/4">Candidate</TableHead>
                    <TableHead className="font-semibold text-xs text-muted-foreground w-36">Score</TableHead>
                    <TableHead className="hidden lg:table-cell font-semibold text-xs text-muted-foreground">Top Skills</TableHead>
                    <TableHead className="text-right font-semibold text-xs text-muted-foreground w-28">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <React.Fragment key={index}>
                      <TableRow 
                        className={`cursor-pointer transition-all hover:bg-muted/30 ${expandedRow === index ? 'bg-primary/5' : ''}`}
                        onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                      >
                        <TableCell className="w-10">
                          <div className="flex items-center justify-center">
                            {expandedRow === index ? 
                              <ChevronDown className="h-4 w-4 text-primary transition-transform duration-200" /> : 
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            }
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-sm text-foreground py-3 truncate">
                          {result.success ? result.analysis?.candidateName : result.fileName}
                        </TableCell>
                        <TableCell>
                          {result.success ? (
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                                <div 
                                  className={`h-full transition-all duration-500 ease-out ${
                                    (result.analysis?.score || 0) >= 80 ? "bg-emerald-500" : 
                                    (result.analysis?.score || 0) >= 60 ? "bg-amber-500" : 
                                    "bg-rose-500"
                                  }`}
                                  style={{ width: `${result.analysis?.score}%` }}
                                />
                              </div>
                              <span className={`font-semibold text-xs shrink-0 ${
                                (result.analysis?.score || 0) >= 80 ? "text-emerald-700" : 
                                (result.analysis?.score || 0) >= 60 ? "text-amber-700" : "text-rose-700"
                              }`}>{result.analysis?.score}%</span>
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                           <div className="flex flex-wrap gap-1.5">
                              {result.analysis?.skills.slice(0, 3).map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-[11px] font-medium bg-muted/60 text-foreground border border-border/50 px-2 py-0">{skill}</Badge>
                              ))}
                              {(result.analysis?.skills?.length || 0) > 3 && (
                                <span className="text-[11px] font-medium text-muted-foreground">+{result.analysis!.skills.length - 3}</span>
                              )}
                           </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {result.success ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-xs font-medium">
                                Screened
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-500/20 text-xs font-medium">
                              Error
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedRow === index && (
                        <TableRow className="bg-muted/20">
                          <TableCell colSpan={5} className="p-0 border-t-0">
                            <div className="p-5 space-y-6 w-full overflow-hidden">
                              {result.success ? (
                                <>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                                    <div className="space-y-4 w-full min-w-0">
                                      <div className="bg-card p-4 rounded-xl border border-border/60 shadow-2xs space-y-1.5 w-full min-w-0">
                                          <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                                            <Star className="h-3.5 w-3.5 fill-primary text-primary shrink-0" /> AI Candidate Summary
                                          </div>
                                          <p className="text-xs leading-relaxed text-foreground font-normal italic break-words whitespace-pre-wrap">"{result.analysis?.summary}"</p>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-3 w-full">
                                        <div className="p-3.5 rounded-xl bg-card border border-border/60 flex items-start gap-3 min-w-0">
                                          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                            <History className="h-4 w-4" />
                                          </div>
                                          <div className="min-w-0">
                                            <h4 className="text-[11px] font-medium text-muted-foreground truncate">Total Experience</h4>
                                            <p className="text-sm font-semibold text-foreground truncate">{result.analysis?.experienceYears} Years</p>
                                          </div>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-card border border-border/60 flex items-start gap-3 min-w-0">
                                          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                            <GraduationCap className="h-4 w-4" />
                                          </div>
                                          <div className="min-w-0 overflow-hidden">
                                            <h4 className="text-[11px] font-medium text-muted-foreground truncate">Education</h4>
                                            <p className="text-sm font-semibold text-foreground truncate" title={result.analysis?.education}>{result.analysis?.education || "N/A"}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                     <div className="space-y-4 w-full min-w-0">
                                         <div className="space-y-2 w-full min-w-0">
                                           <h4 className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                                             <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> Key Strengths
                                           </h4>
                                           <div className="space-y-1.5 w-full min-w-0">
                                             {result.analysis?.pros.map((pro, i) => (
                                               <div key={i} className="flex items-start gap-2 text-xs text-foreground font-normal w-full min-w-0">
                                                 <span className="text-emerald-600 shrink-0 mt-0.5">•</span>
                                                 <span className="leading-relaxed break-words whitespace-normal min-w-0 flex-1">{pro}</span>
                                               </div>
                                             ))}
                                           </div>
                                         </div>
                                         
                                         <div className="space-y-2 w-full min-w-0">
                                           <h4 className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                                             <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" /> Areas of Concern
                                           </h4>
                                           <div className="space-y-1.5 w-full min-w-0">
                                             {result.analysis?.cons.map((con, i) => (
                                               <div key={i} className="flex items-start gap-2 text-xs text-foreground font-normal w-full min-w-0">
                                                 <span className="text-amber-600 shrink-0 mt-0.5">•</span>
                                                 <span className="leading-relaxed break-words whitespace-normal min-w-0 flex-1">{con}</span>
                                               </div>
                                             ))}
                                           </div>
                                         </div>
                                     </div>
                                  </div>
                                  
                                  <div className="pt-4 border-t border-border/60">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-semibold text-foreground">
                                            Identified Skills ({result.analysis?.skills.length})
                                        </h4>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {result.analysis?.skills.map((skill, i) => (
                                        <Badge key={i} variant="outline" className="px-2.5 py-0.5 text-xs font-medium text-foreground border-border/60 bg-background">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-3 pt-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="rounded-lg h-8 text-xs font-medium gap-1.5"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (result.fileData) {
                                            setViewingPdf(result.fileData);
                                          } else {
                                            toast.error("Original file data is missing. Please re-upload.");
                                          }
                                        }}
                                      >
                                        <Maximize2 className="h-3.5 w-3.5" />
                                        View Resume Document
                                      </Button>
                                  </div>
                                </>
                              ) : (
                                <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-800 text-xs flex items-start gap-3">
                                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                                  <div className="space-y-1">
                                    <p className="font-semibold text-rose-900">Processing Error</p>
                                    <p className="text-rose-700 font-normal leading-relaxed">{result.error}</p>
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

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl h-[85vh] bg-card border border-border shadow-xl rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Resume PDF Preview</h3>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground" onClick={() => setViewingPdf(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 w-full bg-muted/20 relative">
              <object 
                data={viewingPdf} 
                type="application/pdf"
                className="w-full h-full border-none"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
                    <div>
                        <p className="font-semibold text-sm">Unable to display PDF directly</p>
                        <p className="text-xs text-muted-foreground">Download the file to view its contents.</p>
                    </div>
                    <Button asChild variant="default" size="sm" className="rounded-lg h-8 text-xs font-medium">
                        <a href={viewingPdf} download="resume.pdf">Download PDF</a>
                    </Button>
                </div>
              </object>
            </div>
            <div className="p-3 border-t border-border flex justify-between items-center bg-card">
              <span className="text-xs text-muted-foreground font-normal">Candidate PDF Document</span>
              <div className="flex gap-2">
                <Button variant="outline" asChild size="sm" className="h-8 text-xs font-medium rounded-lg">
                    <a href={viewingPdf} download="resume.pdf">Download</a>
                </Button>
                <Button variant="default" size="sm" onClick={() => setViewingPdf(null)} className="h-8 text-xs font-medium rounded-lg px-4">Close</Button>
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
      <div className="space-y-6 p-4 animate-in fade-in duration-300">
        <div className="flex justify-between items-center border-b border-border/60 pb-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-4 w-96 rounded opacity-50" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl opacity-60" />
          <Skeleton className="h-28 rounded-2xl opacity-60" />
          <Skeleton className="h-28 rounded-2xl opacity-60" />
        </div>
        <Skeleton className="h-64 rounded-xl opacity-50" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
