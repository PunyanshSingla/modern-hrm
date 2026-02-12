export default function AdminDashboardPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-muted-foreground mb-8">Welcome back. Here is an overview of your organization.</p>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Employees</h3>
                    <div className="text-2xl font-bold mt-2">--</div>
                    <p className="text-xs text-muted-foreground mt-1">Active users</p>
                </div>
                {/* Add more stats here */}
            </div>
        </div>
    );
}
