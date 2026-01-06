import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            About IRMA-Verse
          </h1>
          <div className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400 space-y-4">
            <p>
              Welcome to IRMA-Verse, a modern web application built with Next.js, React, and TypeScript.
            </p>
            <p>
              Our mission is to provide an innovative and user-friendly platform that delivers exceptional experiences through cutting-edge technology.
            </p>
            <p>
              This project leverages the power of:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Next.js 16 for server-side rendering and optimal performance</li>
              <li>React 19 for building interactive user interfaces</li>
              <li>TypeScript for type-safe development</li>
              <li>Tailwind CSS for beautiful, responsive styling</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="/"
          >
            Back to Home
          </Link>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://github.com/Raditt10/IRMA-Verse"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
