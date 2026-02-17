import { connectToDatabase } from "./lib/db";
import EmployeeProfile from "./models/EmployeeProfile";

async function check() {
    await connectToDatabase();
    const employees = await EmployeeProfile.find({}).select('firstName lastName status').lean();
    console.log("Employees and Statuses:");
    employees.forEach(e => {
        console.log(`- ${e.firstName} ${e.lastName}: ${e.status}`);
    });
    process.exit(0);
}

check();
