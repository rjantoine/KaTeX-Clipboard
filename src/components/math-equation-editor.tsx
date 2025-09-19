
"use client";

import React, { useState, useRef, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import {
  Check,
  ClipboardCopy,
  Download,
  FileImage,
  FlaskConical,
  ImageIcon,
  Sigma,
  InfinityIcon,
  Info,
  CaseSensitive,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import type { SmilesDrawer } from "smiles-drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Snippet = {
  label: string;
  value: string;
  tooltip: string;
};

const mathSnippets: Snippet[] = [
  { label: "$$\\frac{a}{b}$$", value: "\\frac{a}{b}", tooltip: "Fraction" },
  { label: "$$\\cdot$$", value: "\\cdot ", tooltip: "Multiplication Dot" },
  { label: "$$\\times$$", value: "\\times ", tooltip: "Multiplication Sign" },
  { label: "$$\\pm$$", value: "\\pm ", tooltip: "Plus-Minus" },
  { label: "$$\\approx$$", value: "\\approx ", tooltip: "Approximately Equal" },
  { label: "$$\\geqslant$$", value: "\\geqslant ", tooltip: "Greater Than or Equal To" },
  { label: "$$\\leqslant$$", value: "\\leqslant ", tooltip: "Less Than or Equal To" },
  { label: "$$x^2$$", value: "x^{2}", tooltip: "Superscript" },
  { label: "$$x_i$$", value: "x_{i}", tooltip: "Subscript" },
  { label: "$$\\sqrt{x}$$", value: "\\sqrt{x}", tooltip: "Square Root" },
  { label: "$$\\rightarrow$$", value: "\\rightarrow ", tooltip: "Right Arrow" },
  { label: "$$\\overrightharpoon{text}$$", value: "\\overrightharpoon{text}", tooltip: "Over Right Harpoon" },
  { label: "$$\\vec{F}$$", value: "\\vec{F}", tooltip: "Vector F" },
  { label: "$$\\text{sin}\\ \\theta$$", value: "\\text{sin}\\ \\theta", tooltip: "Sine" },
  { label: "$$\\text{cos}\\ \\theta$$", value: "\\text{cos}\\ \\theta", tooltip: "Cosine" },
  { label: "$$\\text{tan}\\ \\theta$$", value: "\\text{tan}\\ \\theta", tooltip: "Tangent" },
  { label: "$$\\text{sin}^{-1}\\ \\theta$$", value: "\\text{sin}^{-1}\\ \\theta", tooltip: "Inverse Sine" },
  { label: "$$\\text{cos}^{-1}\\ \\theta$$", value: "\\text{cos}^{-1}\\ \\theta", tooltip: "Inverse Cosine" },
  { label: "$$\\text{tan}^{-1}\\ \\theta$$", value: "\\text{tan}^{-1}\\ \\theta", tooltip: "Inverse Tangent" },
];

const chemistrySnippets: Snippet[] = [
  { label: "A ⇌ B", value: "\\ce{A <=> B}", tooltip: "Equilibrium" },
  { label: "H₂O", value: "\\ce{H2O}", tooltip: "Chemical Formula" },
  { label: "A → B", value: "\\ce{A -> B}", tooltip: "Reaction Arrow" },
  { label: "$$\\ce{^{227}_{90}Th+}$$", value: "\\ce{^{227}_{90}Th+}", tooltip: "Isotope" },
  { label: "$$\\ce{KCr(SO4)2*12H2O}$$", value: "\\ce{KCr(SO4)2*12H2O}", tooltip: "Complex Chemical Formula" },
  { label: "$$\\ce{A-B=C#D}$$", value: "\\ce{A-B=C#D}", tooltip: "Chemical Bonds" },
  { label: "$$\\ce{A ->[above][below] B}$$", value: "\\ce{A ->[{text above}][{text below}] B}", tooltip: "Reaction with text" },
];

const symbolSnippets: Snippet[] = [
  { label: "$$\\pi$$", value: "\\pi ", tooltip: "Pi" },
  { label: "$$\\infty$$", value: "\\infty ", tooltip: "Infinity" },
  { label: "$$\\alpha$$", value: "\\alpha ", tooltip: "Alpha" },
  { label: "$$\\beta$$", value: "\\beta ", tooltip: "Beta" },
  { label: "$$\\gamma$$", value: "\\gamma ", tooltip: "Gamma" },
  { label: "$$\\delta$$", value: "\\delta ", tooltip: "Delta" },
  { label: "$$\\epsilon$$", value: "\\epsilon ", tooltip: "Epsilon" },
  { label: "$$\\theta$$", value: "\\theta ", tooltip: "Theta" },
  { label: "$$\\lambda$$", value: "\\lambda ", tooltip: "Lambda" },
  { label: "$$\\mu$$", value: "\\mu ", tooltip: "Mu" },
  { label: "$$\\sigma$$", value: "\\sigma ", tooltip: "Sigma" },
  { label: "$$\\omega$$", value: "\\omega ", tooltip: "Omega" },
  { label: "$$\\Delta$$", value: "\\Delta ", tooltip: "Delta (uppercase)" },
  { label: "$$\\Omega$$", value: "\\Omega ", tooltip: "Omega (uppercase)" },
];

const initialLatex = `f(x) = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a} \\\\
\\ce{H2O -> H+ + OH-} \\\\
\\smiles{C1=CC=C(C=C1)C(C(C(=O)O)N)O}*{5}`;

declare global {
  interface Window {
    renderMathInElement: (element: HTMLElement, options: any) => void;
    SmilesDrawer: SmilesDrawer;
    katex: any;
  }
}

export function MathEquationEditor() {
  const [latex, setLatex] = useState(initialLatex);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [justCopiedImage, setJustCopiedImage] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState("math");

  useEffect(() => {
    setIsClient(true)
  }, [])
  
  useEffect(() => {
    if (!isClient || !previewRef.current) return;
  
    const renderLatex = () => {
        if (window.renderMathInElement && previewRef.current) {
            let processedLatex = `$$${latex}$$`;
            previewRef.current.innerHTML = processedLatex;

            try {
                window.renderMathInElement(previewRef.current, {
                    delimiters: [
                        { left: "$$", right: "$$", display: true },
                        { left: "$", right: "$", display: false },
                        { left: "\\(", right: "\\)", display: false },
                        { left: "\\[", right: "\\]", display: true }
                    ],
                    throwOnError: false,
                    macros: {
                      "\\hsmiles": "\\htmlClass{smiles-container}{\\htmlClass{rawsmiles}{\\text{#1}} \\htmlClass{smiles-height}{\\text{#2}}}",
                      "\\smiles": "\\@ifstar{\\hsmiles{#1}}{\\hsmiles{#1}{2}}"
                    },
                    trust: true
                });
            } catch (error: any) {
                previewRef.current.innerHTML = `<span class="text-destructive p-4">${error.message}</span>`;
            }
        }
    };

    const processSmiles = () => {
        if (!previewRef.current || !window.SmilesDrawer) return;

        previewRef.current.querySelectorAll(".smiles-container").forEach((el) => {
          const smilesEl = el.querySelector('.rawsmiles .mord');
          const heightEl = el.querySelector('.smiles-height .mord');
          
          const smiles = smilesEl?.textContent?.trim();
          const height = heightEl?.textContent?.trim() || '2';

          if (smiles) {
            const svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgContainer.dataset.smiles = smiles;
            svgContainer.setAttribute("width", "auto")
            svgContainer.setAttribute("height", `${height}em`)
            el.replaceWith(svgContainer);
          }
        });

        window.SmiDrawer.apply();

        previewRef.current.querySelectorAll("svg[data-smiles]").forEach(el => {
          if(!(el instanceof SVGElement)) return;
          const bbox = el.getBBox();
          el.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
        });
    };

    renderLatex();
    processSmiles();
    
    document.querySelectorAll('.latex-button')?.forEach(elem => {
      if (window.renderMathInElement) {
        window.renderMathInElement(elem as HTMLElement, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
          throwOnError: false,
        });
      }
    });
  }, [latex, isClient, activeTab]);

  const addAligned = (alignTarget: "math" | "chem") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const alignRegex = alignTarget === 'math' ? /=/g : /->/g;
    const alignReplacement = alignTarget === 'math' ? ' &= ' : ' &-> ';

    if (start !== end) { // Text is selected
      const selectedText = text.substring(start, end);
      const alignedSelection = `\\begin{aligned}\n${selectedText.replace(alignRegex, alignReplacement)}\n\\end{aligned}`;
      const newText = text.substring(0, start) + alignedSelection + text.substring(end);
      setLatex(newText);
    } else { // No text selected, apply to all
      const newLatex = `\\begin{aligned}\n${text.replace(alignRegex, alignReplacement)}\n\\end{aligned}`;
      setLatex(newLatex);
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    // 1. Auto-closing brackets
    const bracketMap: { [key: string]: string } = { '(': ')', '[': ']', '{': '}' };
    if (bracketMap[event.key]) {
      event.preventDefault();
      const closingBracket = bracketMap[event.key];
      const newText = text.substring(0, start) + event.key + closingBracket + text.substring(end);
      setLatex(newText);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
      return;
    }

    // 3. Auto-exponent brackets
    if (event.key === '^') {
      event.preventDefault();
      const newText = text.substring(0, start) + '^{}' + text.substring(end);
      setLatex(newText);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // 4. Fraction shortcut
    if (event.key === '/') {
        event.preventDefault();
        const textBefore = text.substring(0, start);
        
        const lastSpace = textBefore.lastIndexOf(' ');
        const lastNewline = textBefore.lastIndexOf('\n');
        const lastDoubleSlash = textBefore.lastIndexOf('\\\\');
        
        const lastSeparator = Math.max(lastSpace, lastNewline, lastDoubleSlash > -1 ? lastDoubleSlash + 1 : -1);

        const segment = lastSeparator === -1 ? textBefore : textBefore.substring(lastSeparator + 1);

        const newTextBefore = lastSeparator === -1 ? '' : textBefore.substring(0, lastSeparator + 1);
        const newText = newTextBefore + `\\frac{${segment.trim()}}{}` + text.substring(end);
        
        setLatex(newText);
        
        setTimeout(() => {
            const newCursorPos = newTextBefore.length + `\\frac{${segment.trim()}}{}`.length;
            textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        }, 0);
        return;
    }

    // 2. Auto \left and \right
    if (event.key === ' ') {
      const charBefore = text[start - 1];
      if (charBefore === ')' || charBefore === ']') {
        const openBracket = charBefore === ')' ? '(' : '[';
        let balance = 0;
        let openPos = -1;

        // Find matching opening bracket
        for (let i = start - 1; i >= 0; i--) {
          if (text[i] === charBefore) balance++;
          if (text[i] === openBracket) balance--;
          if (balance === 0) {
            openPos = i;
            break;
          }
        }
        
        if (openPos !== -1) {
            const alreadyLeft = text.substring(openPos - 5, openPos) === '\\left';
            if(alreadyLeft) return;

            const expression = text.substring(openPos + 1, start - 1);
            if (expression.includes('\\sum') || expression.includes('\\int') || expression.includes('\\frac')) {
                event.preventDefault();
                const newText =
                text.substring(0, openPos) +
                '\\left' +
                text.substring(openPos, start-1) +
                '\\right' +
                text.substring(start-1);
                
                setLatex(newText);
                setTimeout(() => {
                  const newCursorPos = start + '\\left'.length + '\\right'.length;
                  textarea.selectionStart = textarea.selectionEnd = newCursorPos;
                }, 0);
                return;
            }
        }
      }
    }
    
    // 6. Newline without \\
    if (event.key === 'Enter' && event.altKey) {
      event.preventDefault();
      const newText = text.substring(0, start) + '\n' + text.substring(end);
      setLatex(newText);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
      return;
    }

    // Original Enter behavior
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const newText = text.substring(0, start) + ' \\\\\n' + text.substring(end);
      setLatex(newText);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };


  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let newSnippet = snippet;
    let selectionStart = start;
    let selectionEnd = start;

    if (selectedText) {
      const firstPlaceholderMatch = snippet.match(/{.*?}/);
      if (firstPlaceholderMatch) {
        newSnippet = snippet.replace(firstPlaceholderMatch[0], `{${selectedText}}`);
        const secondPlaceholderMatch = newSnippet.substring(firstPlaceholderMatch.index! + selectedText.length + 2).match(/{.*?}/);
        if (secondPlaceholderMatch && secondPlaceholderMatch.index !== undefined) {
          const placeholderContent = secondPlaceholderMatch[0].slice(1,-1);
          selectionStart = start + newSnippet.indexOf(secondPlaceholderMatch[0]) + 1;
          selectionEnd = selectionStart + placeholderContent.length;
        } else {
          selectionStart = start + newSnippet.length;
          selectionEnd = selectionStart;
        }
      } else {
        newSnippet = snippet.replace(/{}/, `{${selectedText}}`);
        selectionStart = start + newSnippet.length;
        selectionEnd = selectionStart;
      }
    } else {
      const placeholderMatch = snippet.match(/{(.*?)}/);
      if (placeholderMatch) {
        const placeholder = placeholderMatch[1];
        const placeholderIndex = snippet.indexOf(`{${placeholder}}`);
        selectionStart = start + placeholderIndex + 1;
        selectionEnd = selectionStart + placeholder.length;
      } else if (snippet.includes('{}')) {
        const placeholderIndex = snippet.indexOf('{}');
        selectionStart = start + placeholderIndex + 1;
        selectionEnd = selectionStart;
      } else {
        selectionStart = start + snippet.length;
        selectionEnd = selectionStart;
      }
    }
    
    const newText = text.substring(0, start) + newSnippet + text.substring(end);
    
    setLatex(newText);
    textarea.focus();

    setTimeout(() => {
        textarea.selectionStart = selectionStart;
        textarea.selectionEnd = selectionEnd;
    }, 0);
  };

  const showToastError = (title: string, error: any) => {
    console.error(error);
    toast({
      variant: "destructive",
      title,
      description: error.message || "An unknown error occurred.",
    });
  };

  const copyImageToClipboard = async () => {
    if (!previewRef.current || isCopyingImage || justCopiedImage) return;
    setIsCopyingImage(true);

    try {
        const dataUrl = await htmlToImage.toPng(previewRef.current, {
            pixelRatio: 4,
            backgroundColor: 'transparent',
        });
      
        const blob = await (await fetch(dataUrl)).blob();

        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
        ]);
      
        setJustCopiedImage(true);
        setTimeout(() => setJustCopiedImage(false), 2000);

    } catch (error: any) {
      showToastError("Failed to copy PNG", error);
    } finally {
        setIsCopyingImage(false);
    }
  };
const downloadImage = async (format: "png" | "svg") => {
    if (!previewRef.current) return;
    try {
      let dataUrl;
      if (format === 'png') {
        dataUrl = await htmlToImage.toPng(previewRef.current, { 
          pixelRatio: 4, 
          backgroundColor: 'transparent' 
        });
      } else {
        dataUrl = await htmlToImage.toSvg(previewRef.current, { pixelRatio: 4 });
      }
      
      const link = document.createElement('a');
      link.download = `equation.${format}`;
      link.href = dataUrl;
      link.click();
      link.remove();
    } catch (error: any) {
      showToastError(`Failed to download ${format.toUpperCase()}`, error);
    }
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
              className="flex min-h-[192px] flex-col items-center justify-center overflow-auto rounded-lg bg-muted/50 p-4"
              aria-live="polite"
            >
                {isClient ? <div ref={previewRef} className="text-2xl" /> : <div className="text-2xl">Loading preview...</div>}
            </div>
          </div>
          
          <Tabs defaultValue="math" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="math"><Sigma size={16} className="mr-2"/>Math</TabsTrigger>
              <TabsTrigger value="chem"><FlaskConical size={16} className="mr-2"/>Chemistry</TabsTrigger>
              <TabsTrigger value="symbols"><InfinityIcon size={16} className="mr-2"/>Symbols</TabsTrigger>
            </TabsList>
            <TabsContent value="math" className="mt-4">
              <div className="space-y-4">
                 <Label className="flex items-center gap-2 text-sm font-medium">
                  Snippets
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href="https://katex.org/docs/supported" target="_blank" rel="noopener noreferrer" className="ml-1">
                        <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Supported Functions (KaTeX)</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addAligned('math')}
                          className="h-auto py-2"
                        >
                          <CaseSensitive className="mr-2 h-4 w-4" />
                          Align
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Align selected equations at '='</p>
                      </TooltipContent>
                    </Tooltip>
                  {mathSnippets.map((snippet) => (
                    <Tooltip key={snippet.value}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => insertSnippet(snippet.value)}
                          className="latex-button h-auto py-2"
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
            </TabsContent>
            <TabsContent value="chem" className="mt-4">
               <div className="space-y-4">
                 <Label className="flex items-center gap-2 text-sm font-medium">
                  Snippets
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href="https://mhchem.github.io/MathJax-mhchem/" target="_blank" rel="noopener noreferrer" className="ml-1">
                        <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Supported Chemistry Notation (mhchem)</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addAligned('chem')}
                          className="h-auto py-2"
                        >
                          <CaseSensitive className="mr-2 h-4 w-4" />
                          Align
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Align selected reactions at '→'</p>
                      </TooltipContent>
                    </Tooltip>
                  {chemistrySnippets.map((snippet) => (
                    <Tooltip key={snippet.value}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => insertSnippet(snippet.value)}
                          className="latex-button h-auto py-2"
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
            </TabsContent>
            <TabsContent value="symbols" className="mt-4">
               <div className="space-y-4">
                 <Label className="flex items-center gap-2 text-sm font-medium">
                  Snippets
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href="https://katex.org/docs/supported#letters-and-unicode" target="_blank" rel="noopener noreferrer" className="ml-1">
                        <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Supported Symbols (KaTeX)</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {symbolSnippets.map((snippet) => (
                    <Tooltip key={snippet.value}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => insertSnippet(snippet.value)}
                          className="latex-button h-auto py-2"
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
            </TabsContent>
          </Tabs>

        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4 border-t bg-background/50 p-4 sm:flex-row sm:justify-end">
          <div className="flex flex-wrap justify-end gap-2">
            <Button onClick={() => downloadImage('png')}>
              <FileImage />
              Download as PNG
            </Button>
            <Button 
              onClick={copyImageToClipboard} 
              disabled={isCopyingImage || justCopiedImage}
              variant="secondary"
            >
              {isCopyingImage ? (
                <div className="animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
              ) : justCopiedImage ? (
                <Check />
              ) : (
                <ImageIcon />
              )}
              {isCopyingImage ? "Copying..." : justCopiedImage ? "Copied!" : "Copy as PNG"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}

    