"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import katex from "katex";
import * as htmlToImage from "html-to-image";
import {
  Check,
  ClipboardCopy,
  Download,
  ImageIcon,
  Pilcrow,
  Sigma,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Snippet = {
  label: string;
  value: string;
  tooltip: string;
};

const snippets: Snippet[] = [
  { label: "a/b", value: "\\frac{}{}", tooltip: "Fraction" },
  { label: "x²", value: "^{}", tooltip: "Superscript" },
  { label: "xᵢ", value: "_{}", tooltip: "Subscript" },
  { label: "√", value: "\\sqrt{}", tooltip: "Square Root" },
  { label: "→", value: "\\rightarrow ", tooltip: "Right Arrow" },
  { label: "⇌", value: "\\rightleftharpoons ", tooltip: "Equilibrium" },
  { label: "→text", value: "\\xrightarrow{text}", tooltip: "Text over arrow" },
  { label: "⇀text", value: "\\overrightarrow{text}", tooltip: "Vector/Harpoon over text" },
];

const initialLatex = `f(x) = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}
E = mc^2`;

export function MathEquationEditor() {
  const [latex, setLatex] = useState(initialLatex.replace(/\n/g, "\\\\\n"));
  const [alignEquals, setAlignEquals] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const processedLatex = useMemo(() => {
    let processed = latex.replace(/\\\\\n/g, "\\\\");
    if (alignEquals) {
      processed = `\\begin{aligned}${processed.replace(/=/g, " &=")}\\end{aligned}`;
    }
    return processed;
  }, [latex, alignEquals]);

  useEffect(() => {
    if (previewRef.current) {
      try {
        katex.render(processedLatex, previewRef.current, {
          throwOnError: true,
          displayMode: true,
          output: "html",
          trust: true,
        });
      } catch (error: any) {
        previewRef.current.innerHTML = `<span class="text-destructive p-4">${error.message}</span>`;
      }
    }
  }, [processedLatex]);
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newLatex = latex.substring(0, start) + "\\\\\n" + latex.substring(end);
        setLatex(newLatex);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 3;
        }, 0);
      }
    }
  };

  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + snippet + text.substring(end);
    
    setLatex(newText);
    textarea.focus();

    const cursorPos = snippet.lastIndexOf('{}');
    const selectionPos = cursorPos !== -1 ? start + cursorPos + 1 : start + snippet.length;

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = selectionPos;
    }, 0);
  };

  const copyImageToClipboard = async (format: "png" | "svg") => {
    if (!previewRef.current || isCopying || justCopied) return;
    setIsCopying(true);

    try {
      const katexElement = previewRef.current.querySelector('.katex');
      if (!katexElement) {
        throw new Error("Rendered KaTeX element not found. Please enter a valid equation.");
      }
      
      const toImageFn = format === 'png' ? htmlToImage.toPng : htmlToImage.toSvg;
      const dataUrl = await toImageFn(katexElement as HTMLElement, {
        pixelRatio: 4,
        backgroundColor: 'transparent',
      });
      
      const blob = await (await fetch(dataUrl)).blob();

      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);

    } catch (error: any) {
      console.error("Failed to copy image:", error);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: error.message || "Could not copy the equation as an image.",
      });
    } finally {
      setIsCopying(false);
    }
  };
  
  const copyLatexToClipboard = () => {
    navigator.clipboard.writeText(processedLatex);
    // As per instruction, no success toast. A subtle feedback can be added if needed.
  };

  return (
    <TooltipProvider>
      <Card className="overflow-hidden shadow-2xl shadow-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Sigma className="h-6 w-6" />
            <span>LaTeX Equation Editor</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Textarea
              ref={textareaRef}
              value={latex}
              onKeyDown={handleKeyDown}
              onChange={(e) => setLatex(e.target.value)}
              placeholder="Enter your LaTeX equation here..."
              className="h-48 min-h-[192px] resize-y rounded-lg border-2 border-input bg-background p-4 font-code text-base focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20"
              aria-label="LaTeX Equation Input"
            />
            <div
              className="flex min-h-[192px] items-center justify-center overflow-auto rounded-lg bg-muted/50 p-4"
              aria-live="polite"
            >
                <div ref={previewRef} className="text-2xl" />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Snippets</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {snippets.map((snippet) => (
                <Tooltip key={snippet.value}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertSnippet(snippet.value)}
                      className="font-code"
                    >
                      {snippet.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{snippet.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4 border-t bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="align-equals"
              checked={alignEquals}
              onCheckedChange={(checked) => setAlignEquals(checked as boolean)}
            />
            <Label
              htmlFor="align-equals"
              className="flex cursor-pointer items-center gap-2 font-medium"
            >
              <Pilcrow className="h-4 w-4" />
              <span>Align '=' signs</span>
            </Label>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={copyLatexToClipboard}
            >
              <ClipboardCopy className="mr-2 h-4 w-4" />
              Copy LaTeX
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isCopying || justCopied}>
                  {isCopying ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                  ) : justCopied ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <ImageIcon className="mr-2 h-4 w-4" />
                  )}
                  {isCopying ? "Copying..." : justCopied ? "Copied!" : "Copy as Image"}
                  {!isCopying && <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => copyImageToClipboard("png")}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Copy as PNG</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyImageToClipboard("svg")}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Copy as SVG</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
