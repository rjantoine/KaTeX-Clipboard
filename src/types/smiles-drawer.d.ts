declare module 'smiles-drawer' {
    interface DrawerOptions {
        width?: number;
        height?: number;
        bondThickness?: number;
        bondLength?: number;
        shortBondLength?: number;
        bondSpacing?: number;
        atomVisualization?: 'default' | 'balls' | 'stick' | 'hidden';
        isomeric?: boolean;
        debug?: boolean;
        terminalCarbons?: boolean;
        explicitHydrogens?: boolean;
        overlapSensitivity?: number;
        overlapResolutionIterations?: number;
        compactDrawing?: boolean;
        fontSizeLarge?: number;
        fontSizeSmall?: number;
        fontFamily?: string;
        palette?: { [key: string]: string };
    }

    class Drawer {
        constructor(options: DrawerOptions);
        draw(tree: any, target: string | HTMLElement, theme?: 'light' | 'dark', infoOnly?: boolean): void;
    }

    interface ParserOptions {
        explicitHydrogens?: boolean;
    }

    function parse(smiles: string, successCallback: (tree: any) => void, errorCallback: (err: any) => void, options?: ParserOptions): void;
    
    export { Drawer, DrawerOptions, parse, ParserOptions };

    export interface SmilesDrawer {
        Drawer: typeof Drawer;
        parse: typeof parse;
    }
}
