import { Search } from "lucide-react";
import { Input } from "./ui/input";

export default function SearchInput({searchTerm, setSearchTerm}: {searchTerm: string, setSearchTerm: (term: string) => void}) {
    return (
        <div className="relative flex-1 w-full sm:max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input
                placeholder="Search by name or email..."
                className="pl-10 h-9 text-xs rounded-lg bg-card border-muted-foreground/30 focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/40 shadow-none outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
    )
}