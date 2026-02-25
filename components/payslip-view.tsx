import { useRef, useState } from "react";
import { format } from "date-fns";
import {
    Download,
    Printer,
    Building2,
    User,
    Calendar,
    Wallet,
    Info,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface PayslipViewProps {
    payroll: any;
    employee: any;
}

export function PayslipView({ payroll, employee }: PayslipViewProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    const handlePrint = () => {
        const printContent = printRef.current;
        const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        if (windowPrint && printContent) {
            windowPrint.document.write('<html><head><title>Payslip</title>');
            windowPrint.document.write('<link rel="stylesheet" href="/globals.css">'); // Note: This might not work in all setups without proper CSS paths
            windowPrint.document.write('<style>@media print { body { padding: 20px; } .no-print { display: none; } }</style>');
            windowPrint.document.write('</head><body>');
            windowPrint.document.write(printContent.innerHTML);
            windowPrint.document.write('</body></html>');
            windowPrint.document.close();
            windowPrint.focus();
            setTimeout(() => {
                windowPrint.print();
                windowPrint.close();
            }, 500);
        }
    };

    const handleDownload = async () => {
        if (!printRef.current) {
            toast.error("Payslip content not found");
            return;
        }
        
        setDownloading(true);
        try {
            const dataUrl = await toPng(printRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: "#ffffff",
            });
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [printRef.current.offsetWidth, printRef.current.offsetHeight]
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            const fileName = `Payslip_${format(new Date(payroll.year, payroll.month), "MMM_yyyy")}_${employee.firstName}_${employee.lastName}.pdf`;
            pdf.save(fileName);
            
            toast.success("Payslip downloaded successfully");
        } catch (error: any) {
            console.error("PDF generation failed:", error);
            toast.error(`Generation failed: ${error.message || "Please try again"}`);
        } finally {
            setDownloading(false);
        }
    };

    const earnings = payroll.earnings || [];
    const deductions = payroll.deductions || [];
    const totalEarnings = payroll.totalEarnings || 0;
    const totalDeductions = payroll.totalDeductions || 0;
    const netPayable = payroll.netPayable || 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-end gap-3 no-print">
                <Button 
                    variant="outline" 
                    className="rounded-xl font-bold uppercase tracking-tight"
                    onClick={handlePrint}
                >
                    <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
                <Button 
                    variant="default" 
                    className="rounded-xl font-black uppercase tracking-tight shadow-lg shadow-primary/20"
                    onClick={handleDownload}
                    disabled={downloading}
                >
                    {downloading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Generating...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-4 w-4" /> 
                            Download PDF
                        </>
                    )}
                </Button>
            </div>

            <Card className="border-2 shadow-2xl overflow-hidden bg-white text-slate-900" ref={printRef}>
                <CardContent className="p-10 space-y-10">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-4 border-primary pb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-primary flex items-center justify-center rounded-2xl shadow-lg">
                                <Building2 className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Modern HRM Inc.</h2>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Anupgarh , Sri Ganganagar</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-4xl font-black uppercase italic tracking-tight text-primary">Payslip</h1>
                            <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                                {format(new Date(payroll.year, payroll.month), "MMMM yyyy")}
                            </p>
                        </div>
                    </div>

                    {/* Employee Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 mb-8">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Employee Name</p>
                            <p className="font-bold text-sm text-slate-900 leading-tight">
                                {employee.firstName} {employee.lastName}
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Designation</p>
                            <p className="font-bold text-sm text-slate-900 leading-tight capitalize">
                                {employee.position || "N/A"}
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</p>
                            <p className="font-bold text-sm text-slate-900 leading-tight">
                                {typeof employee.departmentId === 'object' ? employee.departmentId?.name : (employee.department || "N/A")}
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date of Joining</p>
                            <p className="font-bold text-sm text-slate-900 leading-tight tabular-nums">
                                {format(new Date(employee.dateOfJoining || employee.createdAt || new Date()), "dd MMM yyyy")}
                            </p>
                        </div>
                    </div>

                    {/* Attendance Mini-Summary */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                            <p className="text-[9px] font-black uppercase tracking-tighter text-emerald-600">Paid Days</p>
                            <p className="text-xl font-black text-emerald-700 italic">{payroll.attendanceSnapshot?.paidDays || 0}</p>
                        </div>
                        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                            <p className="text-[9px] font-black uppercase tracking-tighter text-rose-600">LOP Days</p>
                            <p className="text-xl font-black text-rose-700 italic">{payroll.attendanceSnapshot?.lopDays || 0}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                            <p className="text-[9px] font-black uppercase tracking-tighter text-blue-600">Working Days</p>
                            <p className="text-xl font-black text-blue-700 italic">{payroll.attendanceSnapshot?.totalDays || 0}</p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                            <p className="text-[9px] font-black uppercase tracking-tighter text-amber-600">Leaves</p>
                            <p className="text-xl font-black text-amber-700 italic">{payroll.attendanceSnapshot?.leaveDays || 0}</p>
                        </div>
                    </div>

                    {/* Earnings & Deductions Table */}
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Earnings Section */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-emerald-600 border-b-2 border-emerald-100 pb-2">Earnings</h3>
                            <div className="space-y-4">
                                {earnings.map((e: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center group">
                                        <span className="text-sm font-bold uppercase text-slate-600 group-hover:text-slate-900 transition-colors">{e.label}</span>
                                        <span className="font-black italic">₹{e.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="pt-4 border-t-2 border-dashed flex justify-between items-center font-black text-lg">
                                    <span className="uppercase italic">Total Earnings</span>
                                    <span className="text-emerald-600 italic">₹{totalEarnings.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deductions Section */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-rose-600 border-b-2 border-rose-100 pb-2">Deductions</h3>
                            <div className="space-y-4">
                                {deductions.map((d: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center group">
                                        <span className="text-sm font-bold uppercase text-slate-600 group-hover:text-slate-900 transition-colors">{d.label}</span>
                                        <span className="font-black italic text-rose-500">₹{d.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="pt-4 border-t-2 border-dashed flex justify-between items-center font-black text-lg">
                                    <span className="uppercase italic">Total Deductions</span>
                                    <span className="text-rose-600 italic">₹{totalDeductions.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Net Pay Final Area */}
                    <div className="bg-primary p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Wallet className="h-32 w-32 text-white" />
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                            <div>
                                <h4 className="text-primary-foreground/70 text-sm font-black uppercase tracking-widest">Net Payable Amount</h4>
                                <p className="text-xs text-primary-foreground/50 font-bold uppercase italic mt-1">Direct credit to your bank account registered with us</p>
                            </div>
                            <div className="text-right">
                                <span className="text-6xl font-black italic text-white tracking-tighter drop-shadow-lg">
                                    ₹{netPayable.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center flex-col items-center gap-2 pt-8 border-t border-slate-100 italic font-bold text-slate-400 uppercase text-[10px] tracking-widest">
                        <p>This is a computer-generated payslip and does not require a physical signature.</p>
                        <p>&copy; {new Date().getFullYear()} Modern HRM.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
