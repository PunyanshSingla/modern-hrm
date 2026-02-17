import { connectToDatabase } from "./lib/db";
import Attendance from "./models/Attendance";
import { startOfMonth, endOfMonth } from "date-fns";

async function verify() {
    await connectToDatabase();
    const start = startOfMonth(new Date(2026, 1)); // Feb
    const end = endOfMonth(new Date(2026, 1));
    const count = await Attendance.countDocuments({
        date: { $gte: start, $lte: end }
    });
    console.log(`Attendance records for Feb 2026: ${count}`);
    process.exit(0);
}

verify();
