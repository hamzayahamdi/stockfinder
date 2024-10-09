import { parseProductName } from '../utils/productNameParser';

// ... other code ...

const categories = ['Table', 'Chair', 'Sofa', 'Bed', /* other categories */];

const fullProductName = "Elegant Wooden Table 120x80cm";
const { productName, category, dimensions } = parseProductName(fullProductName, categories);

console.log(productName);  // "Elegant Wooden"
console.log(category);     // "Table"
console.log(dimensions);   // "120x80cm"

// ... rest of your component or page code ...