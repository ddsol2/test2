import { greeting } from './lib.ts';

console.log(greeting);
document.body.innerHTML += `<h1>${greeting}</h1>`;

// Test a breaking change logic simulation
const result = 5 + 5; 
document.body.innerHTML += `<p>Calculation Test: ${result}</p>`;
throw new Error("Simulated error to test breaking source maps.");
