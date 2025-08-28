import { MathEquationEditor } from "@/components/math-equation-editor";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-headline font-bold text-primary sm:text-5xl">
            MathType Clipboard
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Create beautiful math equations with LaTeX and copy them with one click.
          </p>
        </header>
        <MathEquationEditor />
      </div>
    </main>
  );
}
