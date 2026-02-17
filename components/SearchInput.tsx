import { Search } from "lucide-react";
import { Input } from "./ui/input";

export default function SearchInput({searchTerm, setSearchTerm}: {searchTerm: string, setSearchTerm: (term: string) => void}) {
    return (
        <div className="relative flex-1 w-full sm:max-w-sm group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
                placeholder="Search by name or email..."
                className="pl-11 h-11 rounded-2xl bg-muted/30 border-muted-foreground/10 focus-visible:ring-primary/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
    )
}