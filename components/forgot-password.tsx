"use client"
import Link from "next/link";
import Logo from "./logo";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordCard() {
    const router = useRouter()
    return (
        <div
            data-slot="card"
            className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-15 relative w-full max-w-md overflow-hidden border-none pt-12 shadow-lg"
        >
            <div className="to-primary/10 pointer-events-none absolute top-0 h-52 w-full rounded-t-xl bg-gradient-to-t from-transparent" />

            <svg
                width="520"
                height="209"
                viewBox="0 0 520 209"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="pointer-events-none absolute inset-x-0 top-0"
            >
                {[...Array(25)].map((_, i) => (
                    <line
                        key={i}
                        x1={26.25 + i * 19}
                        y1="0"
                        x2={26.25 + i * 19}
                        y2={[
                            94.7007, 109.92, 130.213, 130.213, 145.433, 172.49, 172.49,
                            172.49, 145.433, 130.213, 130.213, 109.92, 94.7007, 109.92,
                            130.213, 130.213, 145.433, 172.49, 172.49, 172.49, 145.433,
                            130.213, 130.213, 109.92, 94.7007
                        ][i]}
                        stroke={`url(#paint${i}_linear)`}
                        strokeOpacity="0.1"
                        strokeWidth="0.5"
                    />
                ))}
                <defs>
                    {[...Array(25)].map((_, i) => (
                        <linearGradient
                            key={i}
                            id={`paint${i}_linear`}
                            x1={25.5 + i * 19}
                            y1="0"
                            x2={25.5 + i * 19}
                            y2="172.49"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="var(--primary)" />
                            <stop offset="1" stopColor="var(--primary-foreground)" />
                        </linearGradient>
                    ))}
                </defs>
            </svg>

            <div
                data-slot="card-header"
                className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] justify-center gap-6 text-center"
            >
                <Logo />

                <div>
                    <div data-slot="card-title" className="font-semibold mb-1.5 text-2xl">
                        Forgot Password?
                    </div>
                    <div
                        data-slot="card-description"
                        className="text-muted-foreground text-base"
                    >
                        Enter your email and we'll send you instructions to reset your password
                    </div>
                </div>
            </div>

            <div data-slot="card-content" className="px-6 space-y-3">
                <form
                    className="space-y-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.push("/reset-password");
                    }}
                >
                    <div className="space-y-1">
                        <label
                            data-slot="label"
                            htmlFor="userEmail"
                            className="flex items-center gap-2 text-sm font-medium leading-5"
                        >
                            Email address*
                        </label>
                        <input
                            id="userEmail"
                            type="email"
                            placeholder="Enter your email address"
                            data-slot="input"
                            className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:ring-[3px]"
                        />
                    </div>

                    <button
                        type="submit"
                        data-slot="button"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-full rounded-md px-4 py-2 text-sm font-medium"
                    >
                        Send Reset Password Link
                    </button>
                </form>

                <Link
                    href="/login"
                    data-slot="button"
                    className="hover:bg-accent hover:text-accent-foreground h-9 w-full rounded-md px-4 py-2 text-sm  font-medium text-center flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="size-4" />
                    Back to login
                </Link>
            </div>
        </div>
    );
}
