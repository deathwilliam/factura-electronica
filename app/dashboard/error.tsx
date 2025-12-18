'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-full flex-col items-center justify-center space-y-4">
            <h2 className="text-2xl font-bold">¡Algo salió mal!</h2>
            <p className="text-muted-foreground">Ocurrió un error inesperado al cargar el panel.</p>
            <Button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Intentar de nuevo
            </Button>
        </div>
    );
}
