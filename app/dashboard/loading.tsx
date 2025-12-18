export default function DashboardLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-8 w-48 bg-muted rounded mb-2"></div>
                    <div className="h-4 w-64 bg-muted/50 rounded"></div>
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-32 bg-muted rounded"></div>
                    <div className="h-10 w-32 bg-muted rounded"></div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6 rounded-xl border border-border bg-card shadow-sm h-32">
                        <div className="h-4 w-24 bg-muted rounded mb-4"></div>
                        <div className="h-8 w-16 bg-muted rounded"></div>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm min-h-[400px]">
                    <div className="h-6 w-48 bg-muted rounded mb-6"></div>
                    <div className="h-full w-full bg-muted/20 rounded flex items-center justify-center">
                        <div className="h-8 w-8 bg-muted rounded-full"></div>
                    </div>
                </div>
                <div className="col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="h-6 w-32 bg-muted rounded mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-muted"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-full bg-muted rounded"></div>
                                    <div className="h-3 w-1/2 bg-muted/50 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
