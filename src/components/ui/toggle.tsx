"use client"

interface ToggleProps {
    value: boolean
    onChange: (v: boolean) => void
}

export function Toggle({ value, onChange }: ToggleProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(!value)}
            className={`relative w-9 h-5 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted-foreground/30"
                }`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-4" : "translate-x-0"
                    }`}
            />
        </button>
    )
}
