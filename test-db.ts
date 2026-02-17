import { connectToDatabase } from "./lib/db";
import EmployeeProfile from "./models/EmployeeProfile";
import Payroll from "./models/Payroll";
import SalaryStructure from "./models/SalaryStructure";

async function test() {
    try {
        await connectToDatabase();
        console.log("DB Connected");
        
        const employees = await EmployeeProfile.find({}).limit(1);
        console.log("Employees found:", employees.length);
        if (employees.length > 0) {
            console.log("Employee 1:", employees[0].firstName, employees[0].lastName);
            console.log("Salary Structure ID:", employees[0].salaryStructureId);
        }

        const payrolls = await Payroll.find({}).limit(1);
        console.log("Payrolls found:", payrolls.length);
        if (payrolls.length > 0) {
            console.log("Payroll 1 Month/Year:", payrolls[0].month, payrolls[0].year);
            console.log("Payroll 1 Status:", payrolls[0].status);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

test();
