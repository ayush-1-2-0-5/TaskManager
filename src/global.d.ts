// src/global.d.ts or at the root of your project
declare global {

    type CallableFunction = (...args: any[]) => any;

    type NewableFunction = new (...args: any[]) => any;
  
    type Object = { [key: string]: any };

    // Use lowercase boolean instead of Boolean
    let isActive: boolean;  // Remove 'Boolean' and use 'boolean'

}

// Ensure this file is treated as a module
export {};
