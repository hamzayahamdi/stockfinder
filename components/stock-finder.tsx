'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import * as Dialog from '@radix-ui/react-dialog'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  Row,
  getExpandedRowModel,
  ExpandedState,
  CellContext,
  RowData,
} from "@tanstack/react-table"
import { FiArrowDown, FiMenu, FiDownload, FiSearch, FiX, FiChevronRight, FiShoppingBag, FiCheck, FiHome, FiDollarSign, FiPlus, FiMinus, FiCornerDownLeft, FiCornerDownRight } from 'react-icons/fi'
import { FaCouch, FaCoffee, FaBed, FaImage, FaLightbulb, FaTshirt, FaPalette, FaWarehouse, FaStore, FaChair } from 'react-icons/fa'
import * as XLSX from 'xlsx'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { SkeletonLoader } from './skeleton-loader';
import { Spinner } from './spinner';
import { Column } from "@tanstack/react-table"

// Define the Product type based on your backend response
type Product = {
  'Ref. produit': string;
  'Libellé': string;
  'Prix Promo': number;
  'Total Stock': number;
  'Stock Frimoda': number;
  'Stock Casa': number;
  'Stock Rabat': number;
  'Stock Marrakech': number;
  'Stock Tanger': number;
  imageUrl?: string;
  subProducts?: Product[];
  subProductCount?: number;
  [key: string]: any; // Allow string indexing
}

// At the top of the file, add this type definition
type Category = {
  name: string;
  catalogue: string | null;
};

// Then update the categories constant definition
const categories: Category[] = [
  { name: 'Salon en L', catalogue: 'tissues' },
  { name: 'Salon en U', catalogue: 'tissues' },
  { name: 'Canapé 2 Places', catalogue: 'tissues' },
  { name: 'Canapé 3 Places', catalogue: 'tissues' },
  { name: 'Fauteuil', catalogue: 'tissues' },
  { name: 'Chaise', catalogue: 'tissues' },
  { name: 'Table de Salle à Manger', catalogue: 'ceramique' },
  { name: 'Table Basse', catalogue: 'ceramique' },
  { name: "Table d'Appoint", catalogue: 'ceramique' },
  { name: 'Buffet', catalogue: 'ceramique' },
  { name: 'Console', catalogue: 'ceramique' },
  { name: 'Bibliothèque', catalogue: null },
  { name: 'Lit', catalogue: 'tissues' },
  { name: 'Table de Chevet', catalogue: null },
  { name: "Ensemble d'Extérieur", catalogue: 'tissues' },
  { name: 'Canapés Jardin', catalogue: 'tissues' },
  { name: 'Table Extérieur', catalogue: null },
  { name: 'Chaise Extérieur', catalogue: null },
  { name: 'Miroirs', catalogue: null },
  { name: 'Pouf', catalogue: null },
  { name: 'Tableaux', catalogue: null },
  { name: 'Luminaire-Luxalight', catalogue: null },
  { name: 'Couettes', catalogue: null },
  { name: 'Matelas', catalogue: null },
  { name: 'Oreillers', catalogue: null },
  { name: 'Tapis', catalogue: null },
  { name: 'Objets Déco', catalogue: null },
]

// Update the PulsingCell component
const PulsingCell = ({ value }: { value: number | undefined }) => {
  return (
    <div className={`w-full h-full flex items-center justify-center ${value === 0 ? 'bg-red-500' : ''}`}>
      <span className={`font-bold uppercase ${value === 0 ? 'text-white' : ''}`}>{value ?? 0}</span>
    </div>
  );
};

// Update the mobileColumns definition
const mobileColumns: {
  accessorKey: keyof Product;
  header: string;
  cell?: (info: { row: { original: Product } }) => React.ReactNode;
}[] = [
  {
    accessorKey: "Ref. produit",
    header: "Réf.",
    cell: ({ row }) => (
      <div className="flex items-center">
        {row.original.subProducts && (
          <Button
            variant="outline"
            size="sm"
            className="mr-2 p-0 w-6 h-6 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              // Remove row.toggleExpanded() as it's not available in this context
            }}
          >
            <FiPlus className="w-4 h-4" />
          </Button>
        )}
        <span className="font-medium">{row.original['Ref. produit']}</span>
      </div>
    ),
  },
  {
    accessorKey: "Libellé",
    header: "Libellé",
  },
  {
    accessorKey: "Total Stock",
    header: "Stock",
    cell: ({ row }) => <PulsingCell value={row.original['Total Stock']} />,
  },
];

// Add this function to format numbers with space as thousand separator
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Update the desktopColumns definition
const desktopColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "Ref. produit",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-100 text-slate-700 font-bold w-full h-full text-left justify-start"
        >
          Réf.
          <FiArrowDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex items-center">
        {row.original.subProducts && (
          <Button
            variant="outline"
            size="sm"
            className="mr-2 p-0 w-6 h-6 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              row.toggleExpanded();
            }}
          >
            {row.getIsExpanded() ? <FiMinus className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
          </Button>
        )}
        <span className="font-medium">{row.original['Ref. produit']}</span>
      </div>
    ),
  },
  {
    accessorKey: "Libellé",
    header: "Libellé",
    cell: ({ row }) => (
      <div className="flex items-center">
        {row.original.subProductCount && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2 py-0.5 rounded-full">
            +{row.original.subProductCount}
          </span>
        )}
        <span className="font-medium">{row.original['Libellé']}</span>
      </div>
    ),
  },
  {
    accessorKey: "Total Stock",
    header: "STOCK TOTAL",
    cell: ({ row }) => <PulsingCell value={row.original['Total Stock']} />,
    meta: { className: "bg-blue-50 p-0", headerClassName: "bg-blue-100" },
  },
  {
    accessorKey: "Prix Promo",
    header: "PRIX PROMO",
    cell: ({ row }) => {
      const amount = parseFloat(row.original['Prix Promo'].toString())
      return <div className="w-full h-full flex items-center justify-center font-bold uppercase">{formatNumber(Math.round(amount))}</div>
    },
    meta: { className: "bg-green-50 p-0", headerClassName: "bg-green-100" },
  },
  {
    accessorKey: "Stock Frimoda",
    header: "STOCK SKE",
    cell: ({ row }) => <PulsingCell value={row.original['Stock Frimoda']} />,
    meta: { className: "p-0" },
  },
  {
    accessorKey: "Stock Casa",
    header: "Stock Casa",
    cell: ({ row }) => <PulsingCell value={row.original['Stock Casa']} />,
    meta: { className: "p-0" },
  },
  {
    accessorKey: "Stock Rabat",
    header: "Stock Rabat",
    cell: ({ row }) => <PulsingCell value={row.original['Stock Rabat']} />,
    meta: { className: "p-0" },
  },
  {
    accessorKey: "Stock Marrakech",
    header: "Stock Marrakech",
    cell: ({ row }) => <PulsingCell value={row.original['Stock Marrakech']} />,
    meta: { className: "p-0" },
  },
  {
    accessorKey: "Stock Tanger",
    header: "Stock Tanger",
    cell: ({ row }) => <PulsingCell value={row.original['Stock Tanger']} />,
    meta: { className: "p-0" },
  },
]

// Replace the existing tissues array with this:
const tissues = [
  { ref: 'SHE34', image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=300&h=300&fit=crop' },
  { ref: 'SHE35', image: 'https://images.unsplash.com/photo-1629789877828-075b2f1e0e89?w=300&h=300&fit=crop' },
  { ref: 'SHE36', image: 'https://images.unsplash.com/photo-1620814153812-9f4d6f0d73d9?w=300&h=300&fit=crop' },
  { ref: 'SHE37', image: 'https://images.unsplash.com/photo-1615796701805-2094ac54bbf9?w=300&h=300&fit=crop' },
  { ref: 'SHE38', image: 'https://images.unsplash.com/photo-1615796701533-5f8fe04b3563?w=300&h=300&fit=crop' },
  { ref: 'SHE39', image: 'https://images.unsplash.com/photo-1615796701591-5e5507c366fe?w=300&h=300&fit=crop' },
  { ref: 'SHE40', image: 'https://images.unsplash.com/photo-1615796701614-3c8c0f58bfd3?w=300&h=300&fit=crop' },
  { ref: 'SHE41', image: 'https://images.unsplash.com/photo-1615796701649-2c5a2b8d0f4f?w=300&h=300&fit=crop' },
];

// You can also update the ceramics array similarly if you want:
const ceramics = [
  { ref: 'CER.WHT', image: 'https://images.unsplash.com/photo-1615796701698-5e4b2f1e0e0a?w=300&h=300&fit=crop' },
  { ref: 'CER.BLK', image: 'https://images.unsplash.com/photo-1615796701728-1e0e8e0b0b0f?w=300&h=300&fit=crop' },
  // ... add more as needed
];

// Update the CatalogueItem type
type CatalogueItem = {
  ref: string;
  color?: string;
  'image url': string;
  availability: 'yes' | 'no';
}

const fetchProductImage = async (ref: string) => {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/1mWNxfuTYDho--Z5qCzvBErN2w0ZNBelND6rdzPAyC90/gviz/tq?tqx=out:json`)
    const text = await response.text()
    const data = JSON.parse(text.substr(47).slice(0, -2))
    
    const imageRow = data.table.rows.find((row: any) => row.c[3]?.v === ref)
    return imageRow ? imageRow.c[7]?.v : null // Image URL is in the 8th column (index 7)
  } catch (error) {
    console.error('Error fetching product image:', error)
    return null
  }
}

const getProductImage = (product: Product, categoryObj: typeof categories[0] | undefined): { mainSrc: string; smallSrc?: string; label?: string; isCeramic?: boolean } => {
  const mainSrc = product.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image';
  
  if (categoryObj?.catalogue === 'tissues') {
    const ref = product['Ref. produit'];
    const baseImageUrl = 'https://sketch-design.ma/wp-content/uploads/2024/10/Layer-0.png';
    
    if (ref.endsWith('-D')) {
      return { mainSrc, smallSrc: baseImageUrl, label: 'Droitier' };
    } else if (ref.endsWith('-G')) {
      return { mainSrc, smallSrc: baseImageUrl, label: 'Gauchier' };
    }
  } else if (categoryObj?.catalogue === 'ceramique') {
    return { mainSrc, isCeramic: true };
  }
  
  return { mainSrc };
};

type SmallImageType = {
  src: string;
  alt: string;
  ref: string;
};

// Update the groupProducts function
const groupProducts = (products: Product[]): Product[] => {
  const groupedMap = new Map<string, Product[]>();
  
  products.forEach(product => {
    const group = groupedMap.get(product.Libellé) || [];
    group.push(product);
    groupedMap.set(product.Libellé, group);
  });

  return Array.from(groupedMap.values()).map(group => {
    group.sort((a, b) => a['Ref. produit'].length - b['Ref. produit'].length);
    const mainProduct = { ...group[0] };
    if (group.length > 1) {
      mainProduct.subProducts = group.slice(1);
      mainProduct.subProductCount = group.length - 1;
      ['Total Stock', 'Stock Frimoda', 'Stock Casa', 'Stock Rabat', 'Stock Marrakech', 'Stock Tanger'].forEach(key => {
        mainProduct[key] = group.reduce((sum, product) => sum + (Number(product[key]) || 0), 0);
      });
    }
    return mainProduct;
  });
};

export function StockFinderComponent() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].name)
  const [searchTerm, setSearchTerm] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [catalogueSearchTerm, setCatalogueSearchTerm] = useState('')
  const [catalogueItems, setCatalogueItems] = useState<CatalogueItem[]>([])
  const [availableCount, setAvailableCount] = useState(0);
  const [unavailableCount, setUnavailableCount] = useState(0);
  const [openCatalogueItem, setOpenCatalogueItem] = useState<CatalogueItem | null>(null);
  const [openSmallImage, setOpenSmallImage] = useState<SmallImageType | null>(null);
  const [groupedProducts, setGroupedProducts] = useState<Product[]>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isCatalogueLoading, setIsCatalogueLoading] = useState(false)
  const [isProductDetailsLoading, setIsProductDetailsLoading] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [inStockCount, setInStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [totalProductCount, setTotalProductCount] = useState(0);
  const [openTissueImage, setOpenTissueImage] = useState<{ src: string; alt: string } | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ src: '', alt: '' });
  const [tissueImageOverlay, setTissueImageOverlay] = useState<{ src: string; alt: string } | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [isCatalogueModalLoading, setIsCatalogueModalLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productNameFontSize, setProductNameFontSize] = useState(20);
  const productNameRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async (type: 'category' | 'search', query: string) => {
    try {
      const response = await fetch(`https://stockfinder.sketchdesign.ma/data.php?type=${type}&query=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      console.log('Received data:', data)
      if (Array.isArray(data)) {
        const transformedData = data.map(item => ({
          ...item,
          'Ref. produit': item['Ref. produit'] || item['ref'] || item['Ref produit'] || ''
        }))
        setAllProducts(transformedData)
        setFilteredProducts(transformedData)
      } else if (data.error) {
        console.error('API Error:', data.error)
        setAllProducts([])
        setFilteredProducts([])
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setAllProducts([])
      setFilteredProducts([])
    }
  }

  useEffect(() => {
    fetchProducts('category', selectedCategory)
  }, [selectedCategory])

  useEffect(() => {
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = allProducts.filter(product => 
        product['Ref. produit'].toLowerCase().includes(lowercasedSearch) ||
        product['Libellé'].toLowerCase().includes(lowercasedSearch)
      )
      const grouped = groupProducts(filtered);
      setGroupedProducts(grouped);
      setFilteredProducts(grouped);
    } else {
      const grouped = groupProducts(allProducts);
      setGroupedProducts(grouped);
      setFilteredProducts(grouped);
    }
  }, [searchTerm, allProducts])

  // Add this useEffect to update groupedProducts
  useEffect(() => {
    const grouped = groupProducts(filteredProducts);
    setGroupedProducts(grouped);
  }, [filteredProducts]);

  // Update the renderCell function
  const renderCell = useCallback((info: CellContext<Product, unknown>) => {
    if (!info || !info.column.columnDef.cell) {
      return null;
    }
    return typeof info.column.columnDef.cell === 'function'
      ? flexRender(info.column.columnDef.cell, info)
      : null;
  }, []);

  // Update the desktopTable definition
  const desktopTable = useReactTable({
    data: groupedProducts,
    columns: desktopColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    state: {
      sorting,
      expanded,
    },
  })

  // Add this memoized function to get visible rows
  const visibleRows = useMemo(() => {
    return desktopTable.getRowModel().rows;
  }, [desktopTable]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredProducts)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products")
    XLSX.writeFile(workbook, "stock_finder_export.xlsx")
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false)
      }
    }

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sidebarOpen])

  const selectedCategoryObj = categories.find(cat => cat.name === selectedCategory)

  // Function to fetch catalogue data from Google Sheets
  const fetchCatalogueData = async (sheetId: string, isTissue: boolean) => {
    try {
      const response = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`)
      const text = await response.text()
      const data = JSON.parse(text.substr(47).slice(0, -2))
      
      const items: CatalogueItem[] = data.table.rows.slice(1).map((row: any) => {
        if (isTissue) {
          return {
            ref: row.c[0]?.v || '',
            'image url': row.c[1]?.v || '',
            availability: row.c[2]?.v === 'yes' ? 'yes' : 'no'
          }
        } else {
          return {
            ref: row.c[0]?.v || '',
            color: row.c[1]?.v || '',
            'image url': row.c[2]?.v || '',
            availability: row.c[3]?.v === 'yes' ? 'yes' : 'no'
          }
        }
      })
      
      console.log(`Parsed ${isTissue ? 'tissue' : 'ceramic'} catalogue items:`, items);
      setCatalogueItems(items)
    } catch (error) {
      console.error('Error fetching catalogue data:', error)
    }
  }

  useEffect(() => {
    if (selectedCategoryObj?.catalogue === 'ceramique') {
      fetchCatalogueData('1VJs3bTDNFpdw88j5XYXxbiakzT2r5yuu4yRi7FjozSQ', false)
        .then(() => console.log('Ceramic catalogue items after fetch:', catalogueItems));
    } else if (selectedCategoryObj?.catalogue === 'tissues') {
      fetchCatalogueData('1J9-7o_xOC2g-aLJfBdYru5qMh4UbOztgWSdjaeRtnX8', true)
        .then(() => console.log('Tissue catalogue items after fetch:', catalogueItems));
    }
  }, [selectedCategoryObj]);

  // Remove memoized functions and virtualization
  const findMatchingCatalogueItem = (productRef: string) => {
    const lowercaseProductRef = productRef.toLowerCase();

    if (selectedCategoryObj?.catalogue === 'ceramique') {
      return catalogueItems.find((item: CatalogueItem) => {
        const lowercaseItemRef = item.ref.toLowerCase();
        return lowercaseProductRef.includes(lowercaseItemRef);
      });
    } else {
      return catalogueItems.find((item: CatalogueItem) => 
        lowercaseProductRef.includes(item.ref.toLowerCase())
      );
    }
  };

  const filteredCatalogueItems = catalogueItems.filter(item => 
    item.ref.toLowerCase().includes(catalogueSearchTerm.toLowerCase()) ||
    (item.color && item.color.toLowerCase().includes(catalogueSearchTerm.toLowerCase()))
  );

  // Update the CatalogueItem component
  const CatalogueItem = ({ item, onClick }: { item: CatalogueItem; onClick: () => void }) => {
    const handleClick = () => {
      setIsCatalogueModalLoading(true);
      onClick();
      // Add a small delay before setting loading to false to allow for state updates
      setTimeout(() => setIsCatalogueModalLoading(false), 100);
    };

    return (
      <div
        className="group relative w-20 h-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-sm shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105"
        onClick={handleClick}
      >
        <Image
          src={item['image url']}
          alt={item.ref}
          layout="fill"
          objectFit="cover"
          className="transition-opacity duration-300 group-hover:opacity-80"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-1">
          <p className="text-[9px] font-medium text-white truncate">
            {item.color || item.ref}
          </p>
        </div>
        <div className="absolute top-1 right-1">
          <span className={`text-[7px] font-medium px-1 py-0.5 rounded-sm shadow whitespace-nowrap ${
            item.availability === 'yes' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {item.availability === 'yes' ? 'EN STOCK' : 'ÉPUISÉ'}
          </span>
        </div>
      </div>
    );
  };

  // Update the processProductDetails function
  const processProductDetails = (product: Product) => {
    const libelle = product['Libellé'].replace(/,/g, '').trim();
    
    // Function to normalize text (remove accents and special characters)
    const normalize = (text: string) => {
      return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const normalizedLibelle = normalize(libelle);
    
    // Get the selected category
    const selectedCategoryObj = categories.find(cat => cat.name === selectedCategory);
    
    if (!selectedCategoryObj) {
      return { productName: libelle, category: '', dimensions: '' };
    }

    let category = '';
    let productName = libelle;
    let dimensions = '';

    // Special handling for "Canapé"
    if (selectedCategoryObj.name.startsWith('Canapé')) {
      const canapeIndex = normalizedLibelle.indexOf('canape');
      if (canapeIndex !== -1) {
        category = 'Canapé';
        productName = libelle.slice(0, canapeIndex).trim();
        dimensions = libelle.slice(canapeIndex + 'canape'.length).trim();
      }
    } 
    // Special handling for "Miroirs"
    else if (selectedCategoryObj.name === 'Miroirs') {
      const miroirIndex = normalizedLibelle.indexOf('miroir');
      if (miroirIndex !== -1) {
        category = 'Miroirs';
        productName = libelle.slice(0, miroirIndex).trim();
        dimensions = libelle.slice(miroirIndex + 'miroir'.length).trim();
      }
    } 
    else {
      const normalizedKeyword = normalize(selectedCategoryObj.name);
      
      // Check if the full normalized keyword is in the normalized libelle
      if (normalizedLibelle.includes(normalizedKeyword)) {
        category = selectedCategoryObj.name;
        const index = normalizedLibelle.indexOf(normalizedKeyword);
        productName = libelle.slice(0, index).trim();
        dimensions = libelle.slice(index + selectedCategoryObj.name.length).trim();
      }
    }

    return { 
      productName: productName.trim(), 
      category: category.trim(), 
      dimensions: dimensions.trim() 
    };
  };

  const setSelectedProductWithImage = async (product: Product | null) => {
    if (product) {
      setIsModalOpen(true);
      setIsModalLoading(true);
      try {
        const { productName, category, dimensions } = processProductDetails(product);
        const imageUrl = await fetchProductImage(product['Ref. produit']);
        setSelectedProduct({ 
          ...product, 
          processedName: productName, 
          processedCategory: category, 
          processedDimensions: dimensions,
          imageUrl: imageUrl || undefined 
        });
      } catch (error) {
        console.error('Error setting selected product:', error);
        // Handle error (e.g., show error message to user)
      } finally {
        setIsModalLoading(false);
      }
    } else {
      setSelectedProduct(null);
      setIsModalOpen(false);
    }
  };

  // Add this useEffect to update the counters
  useEffect(() => {
    const available = catalogueItems.filter(item => item.availability === 'yes').length;
    const unavailable = catalogueItems.length - available;
    setAvailableCount(available);
    setUnavailableCount(unavailable);
  }, [catalogueItems]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleCloseCatalogueModal = () => {
    setOpenCatalogueItem(null);
    setIsCatalogueModalLoading(false);
  };

  // Add this type guard function if it's not already present
  function hasAccessorKey<T>(column: ColumnDef<T, unknown>): column is ColumnDef<T, unknown> & { accessorKey: keyof T } {
    return 'accessorKey' in column;
  }

  const updateCategoryCounts = useCallback((products: Product[]) => {
    const counts: Record<string, number> = {};
    products.forEach(product => {
      const category = product['Catégorie'] || 'Uncategorized';
      counts[category] = (counts[category] || 0) + 1;
    });
    setCategoryCounts(counts);
  }, []);

  useEffect(() => {
    updateCategoryCounts(allProducts);
  }, [allProducts, updateCategoryCounts]);

  // Add this useEffect to calculate the counts
  useEffect(() => {
    const inStock = filteredProducts.filter(product => product['Total Stock'] > 0).length;
    const outOfStock = filteredProducts.filter(product => product['Total Stock'] <= 0).length;
    const total = filteredProducts.length;

    setInStockCount(inStock);
    setOutOfStockCount(outOfStock);
    setTotalProductCount(total);
  }, [filteredProducts]);

  const handleCloseTissueModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenTissueImage(null);
  };

  const openImageModal = (src: string, alt: string) => {
    setSelectedImage({ src, alt });
    setImageModalOpen(true);
  };

  const closeImageModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageModalOpen(false);
  };

  // Add this function at the top of your file, outside of the component
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  useEffect(() => {
    const adjustFontSize = () => {
      if (productNameRef.current && selectedProduct) {
        let size = 20;
        productNameRef.current.style.fontSize = `${size}px`;
        
        while (productNameRef.current.scrollHeight > productNameRef.current.clientHeight && size > 10) {
          size--;
          productNameRef.current.style.fontSize = `${size}px`;
        }
        
        setProductNameFontSize(size);
      }
    };

    if (selectedProduct) {
      adjustFontSize();
    }
  }, [selectedProduct]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans uppercase">
      {/* Sidebar without icons */}
      <div 
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 w-48 bg-[#0156B3] text-white shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col`}
      >
        <div className="bg-[#0156B3] z-20 p-3 shadow-md">
          <Image 
            src="https://stockfinder.sketchdesign.ma/sketch.svg" 
            alt="Stock Finder Logo" 
            width={120} 
            height={40} 
            className="w-full h-auto"
          />
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-1">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={selectedCategory === category.name ? "secondary" : "ghost"}
              className="w-full justify-between mb-1 text-left hover:bg-white hover:text-[#0156B3] transition-colors duration-300 text-[11px] py-1 px-2 rounded-md font-bold"
              onClick={() => {
                setSelectedCategory(category.name)
                setSidebarOpen(false)
              }}
            >
              <span>{category.name.toUpperCase()}</span>
              {categoryCounts[category.name] !== undefined && (
                <span className="bg-white text-[#0156B3] text-[9px] px-1.5 py-0.5 rounded-full">
                  {categoryCounts[category.name]}
                </span>
              )}
            </Button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-[#0156B3] text-white px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                className="text-white p-1"
              >
                <FiMenu className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
              <h1 className="text-xs sm:text-sm font-bold truncate max-w-[120px] sm:max-w-[160px]">
                {selectedCategory.toUpperCase()}
              </h1>
            </div>
            <div className="flex items-center space-x-1">
              <span className="px-1 py-0.5 bg-green-500 text-white rounded-full whitespace-nowrap text-[8px] sm:text-[10px]">
                En stock: {inStockCount}
              </span>
              <span className="px-1 py-0.5 bg-red-500 text-white rounded-full whitespace-nowrap text-[8px] sm:text-[10px]">
                En rupture: {outOfStockCount}
              </span>
              <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded-full whitespace-nowrap text-[8px] sm:text-[10px]">
                Total: {totalProductCount}
              </span>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Redesigned Catalogue Section */}
          {selectedCategoryObj?.catalogue && (
            <div className="bg-white rounded-xl shadow-lg p-3">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-semibold text-[#787878] whitespace-nowrap">
                  {selectedCategoryObj.catalogue === 'tissues' ? 'TISSUS' : 'CÉRAMIQUES'}
                </h3>
                <div className="relative w-full sm:w-48">
                  <Input
                    type="text"
                    placeholder="Recherche réf/couleur"
                    value={catalogueSearchTerm}
                    onChange={(e) => setCatalogueSearchTerm(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 text-xs transition-shadow duration-300 focus:shadow-md"
                  />
                  <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="flex space-x-2">
                  {filteredCatalogueItems.map((item, index) => (
                    <CatalogueItem
                      key={index}
                      item={item}
                      onClick={() => setOpenCatalogueItem(item)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Combined Search, Export, and Data Table Section */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="bg-white rounded-t-xl">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start sm:space-y-0 p-2">
                {/* Counters (visible only on desktop) */}
                <div className="hidden lg:flex flex-wrap gap-2 text-[11px] mb-2 sm:mb-0">
                  <span className="px-2 py-1 bg-green-500 text-white rounded-full whitespace-nowrap">
                    En stock: {inStockCount}
                  </span>
                  <span className="px-2 py-1 bg-red-500 text-white rounded-full whitespace-nowrap">
                    En rupture: {outOfStockCount}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                    Total produits: {totalProductCount}
                  </span>
                </div>
                
                {/* Search and Export */}
                <div className="flex w-full sm:w-auto items-center space-x-2">
                  <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                    <Input
                      type="text"
                      placeholder="Search by Réf. or Libellé"
                      className="pl-10 pr-4 py-2 w-full transition-shadow duration-300 focus:shadow-md"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                  <Button 
                    onClick={exportToExcel} 
                    className="hidden sm:flex bg-[#0156B3] hover:bg-[#0167D3] text-white transition-colors duration-300 font-bold"
                  >
                    <FiDownload className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Responsive Data Table */}
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <Table className="hidden lg:table w-full text-xs">
                <TableHeader className="bg-gray-200">
                  {desktopTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead 
                          key={header.id}
                          className={`font-bold ${
                            header.index === 0 || header.index === 1 ? 'text-left' : 'text-center'
                          } ${(header.column.columnDef as any).meta?.headerClassName || ''}`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {desktopTable.getRowModel().rows.map((row) => (
                    <React.Fragment key={row.id}>
                      <TableRow 
                        className={`${
                          row.index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                        } hover:bg-blue-50 transition-all duration-200 ${
                          row.getIsExpanded() ? 'bg-blue-100 shadow-md z-10 relative' : ''
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell 
                            key={cell.id} 
                            className={`${(cell.column.columnDef as any).meta?.className || ''} ${
                              cell.column.id?.startsWith('Stock') ? 'border-l border-gray-200' : ''
                            }`}
                          >
                            <div 
                              className={`${
                                cell.column.id === "Ref. produit" ? 'text-left' : 'text-center cursor-pointer'
                              }`}
                              onClick={() => {
                                if (cell.column.id !== "Ref. produit") {
                                  setSelectedProductWithImage(row.original);
                                }
                              }}
                            >
                              {cell.column.columnDef.cell ? renderCell(cell.getContext()) : null}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                      {row.getIsExpanded() && row.original.subProducts && (
                        row.original.subProducts.map((subProduct: Product, index: number) => (
                          <TableRow 
                            key={subProduct['Ref. produit']}
                            className={`bg-blue-50 hover:bg-blue-200 transition-colors duration-200 cursor-pointer ${
                              index === (row.original.subProducts?.length ?? 0) - 1 ? 'shadow-md' : ''
                            }`}
                            onClick={() => setSelectedProductWithImage(subProduct)}
                          >
                            {desktopColumns.map((column, colIndex) => (
                              <TableCell 
                                key={column.id} 
                                className={`${colIndex === 0 ? 'text-left' : 'text-center'} ${
                                  (column.meta as any)?.className || ''
                                } ${column.id?.startsWith('Stock') ? 'border-l border-gray-200' : ''}`}
                              >
                                <div className={`${colIndex === 0 ? 'pl-6' : ''}`}>
                                  {colIndex === 0 ? (
                                    <span className="text-xs text-blue-600">└ {subProduct['Ref. produit']}</span>
                                  ) : (
                                    column.cell && typeof column.cell === 'function' ? 
                                      flexRender(column.cell, {
                                        getValue: () => hasAccessorKey(column) ? subProduct[column.accessorKey] : undefined,
                                        renderValue: () => hasAccessorKey(column) ? subProduct[column.accessorKey] : undefined,
                                        row: {
                                          original: subProduct,
                                          index,
                                          id: subProduct['Ref. produit'],
                                          depth: 1,
                                          subRows: [],
                                        } as unknown as Row<Product>,
                                        column: column as Column<Product, unknown>,
                                        table: desktopTable,
                                      } as CellContext<Product, unknown>) : null
                                  )}
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>

              {/* Mobile Table */}
              <Table className="lg:hidden w-full text-xs">
                <TableHeader>
                  <TableRow>
                    {mobileColumns.map((column) => (
                      <TableHead key={column.accessorKey} className="font-bold text-left">
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedProducts.map((product, index) => (
                    <React.Fragment key={product['Ref. produit']}>
                      <TableRow 
                        className={`${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                        } hover:bg-blue-50 transition-all duration-200 cursor-pointer`}
                        onClick={() => setSelectedProductWithImage(product)}
                      >
                        {mobileColumns.map((column) => (
                          <TableCell key={column.accessorKey}>
                            {column.accessorKey === 'Ref. produit' ? (
                              <div className="flex items-center">
                                {product.subProducts && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mr-2 p-0 w-6 h-6 rounded-full"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpanded(prev => ({
                                        ...prev,
                                        [product['Ref. produit']]: !prev[product['Ref. produit']]
                                      }));
                                    }}
                                  >
                                    {expanded[product['Ref. produit']] ? <FiMinus className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
                                  </Button>
                                )}
                                <span>{product[column.accessorKey]}</span>
                              </div>
                            ) : column.cell 
                              ? column.cell({ row: { original: product } })
                              : product[column.accessorKey]}
                          </TableCell>
                        ))}
                      </TableRow>
                      {expanded[product['Ref. produit']] && product.subProducts && product.subProducts.map((subProduct: Product, subIndex: number) => (
                        <TableRow 
                          key={subProduct['Ref. produit']}
                          className={`${
                            (index + subIndex + 1) % 2 === 0 ? 'bg-blue-50' : 'bg-blue-100'
                          } hover:bg-blue-200 transition-colors duration-200 cursor-pointer`}
                          onClick={() => setSelectedProductWithImage(subProduct)}
                        >
                          {mobileColumns.map((column) => (
                            <TableCell key={column.accessorKey} className="pl-6">
                              {column.cell 
                                ? column.cell({ row: { original: subProduct } })
                                : subProduct[column.accessorKey]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={handleCloseModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <AnimatePresence>
            {isModalOpen && (
              <Dialog.Content className="fixed inset-0 flex items-center justify-center z-[60]" onClick={handleCloseModal}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-white rounded-2xl shadow-2xl w-[95vw] sm:w-[90vw] max-w-[450px] overflow-hidden flex flex-col max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isModalLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <Spinner size="large" />
                    </div>
                  ) : selectedProduct ? (
                    <div className="product-modal-content relative flex-grow flex flex-col overflow-auto">
                      <Dialog.Title className="sr-only">Product Details</Dialog.Title>
                      <Dialog.Description className="sr-only">
                        Detailed information about the selected product
                      </Dialog.Description>
                      
                      {/* Product Name and Dimensions Section */}
                      <div className="bg-blue-600 p-4 rounded-t-2xl">
                        <div className="flex flex-wrap items-center justify-between mb-2">
                          <div className="flex-grow flex items-center space-x-2 mr-8"> {/* Added mr-8 to prevent overlap with close button */}
                            <motion.h2 
                              className="text-2xl font-bold text-white truncate"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {selectedProduct.processedName?.toUpperCase()}
                            </motion.h2>
                            {selectedProduct.processedDimensions && (
                              <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                              >
                                <div className="bg-[#ffed00] py-1 px-2 transform skew-x-[-20deg] shadow-lg">
                                  <p className="text-sm font-bold text-black transform skew-x-[20deg] inline-block">
                                    {selectedProduct.processedDimensions.toUpperCase()}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                        <motion.div 
                          className="flex items-center gap-2 mt-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <span className="text-sm text-blue-100">
                            {selectedProduct['Ref. produit']?.toUpperCase() || 'N/A'}
                          </span>
                          {selectedProduct.processedCategory && (
                            <span className="inline-block bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {selectedProduct.processedCategory.toUpperCase()}
                            </span>
                          )}
                        </motion.div>
                      </div>

                      {/* Product Image */}
                      <div className="relative h-64 bg-white">
                        <Image
                          src={selectedProduct.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
                          alt={selectedProduct['Libellé']}
                          layout="fill"
                          objectFit="contain"
                          className="rounded-t-2xl"
                          quality={75}
                          placeholder="blur"
                          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                        />
                        <motion.div 
                          className="absolute bottom-4 right-4 overflow-visible z-10"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                        >
                          <div className="bg-[#ffed00] py-1 px-4 transform skew-x-[-20deg] shadow-lg">
                            <p className="text-xl font-bold text-black transform skew-x-[20deg] inline-block">
                              {formatPrice(selectedProduct['Prix Promo'])} <span className="text-xl">DH</span>
                            </p>
                          </div>
                        </motion.div>
                      </div>
                      
                      <div className="p-4 space-y-4 bg-blue-50">
                        {(() => {
                          const { smallSrc, label, isCeramic } = getProductImage(selectedProduct, selectedCategoryObj);
                          const matchingItem = findMatchingCatalogueItem(selectedProduct['Ref. produit']);

                          return (
                            <div className="space-y-3">
                              {label && (
                                <motion.div 
                                  className="bg-blue-100 p-3 rounded-lg flex items-center justify-between"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.5, type: "spring" }}
                                >
                                  <span className="text-base font-semibold text-blue-700">Orientation:</span>
                                  <div className="flex items-center space-x-3">
                                    <motion.span 
                                      className={`text-base font-bold px-3 py-1 rounded-full ${
                                        label === 'Gauchier' 
                                          ? 'bg-purple-500 text-white' 
                                          : 'bg-orange-500 text-white'
                                      }`}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      {label}
                                    </motion.span>
                                    {smallSrc && (
                                      <motion.div 
                                        className="w-14 h-14 relative"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.3 }}
                                      >
                                        <Image
                                          src={smallSrc}
                                          alt="Orientation Image"
                                          layout="fill"
                                          objectFit="contain"
                                          style={{
                                            transform: label === 'Gauchier' ? 'scaleX(-1)' : undefined,
                                          }}
                                        />
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                              {matchingItem && (
                                <div className="bg-blue-100 p-3 rounded-lg flex items-center justify-between">
                                  <span className="text-base font-semibold text-blue-700">{isCeramic ? 'Céramique' : 'Tissu'}:</span>
                                  <div className="flex items-center space-x-2">
                                    <div 
                                      className="w-10 h-10 relative cursor-pointer"
                                      onClick={() => setTissueImageOverlay({ src: matchingItem['image url'], alt: matchingItem.color || matchingItem.ref })}
                                    >
                                      <Image
                                        src={matchingItem['image url']}
                                        alt={matchingItem.color || matchingItem.ref}
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded-md"
                                      />
                                    </div>
                                    <span className="text-base font-bold text-blue-600">
                                      {matchingItem.color || matchingItem.ref}
                                    </span>
                                    {!isCeramic && (
                                      <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                                        matchingItem.availability === 'yes' 
                                          ? 'bg-green-500 text-white' 
                                          : 'bg-red-500 text-white'
                                      }`}>
                                        {matchingItem.availability === 'yes' ? 'EN STOCK' : 'ÉPUISÉ'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        <div className="bg-blue-100 p-3 rounded-xl shadow-lg overflow-hidden">
                          <motion.div 
                            className="bg-blue-600 p-2 rounded-lg mb-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0, type: "spring" }}
                          >
                            <p className="text-sm font-bold text-blue-100 text-center uppercase">SKE</p>
                            <p className="text-xl font-bold text-white text-center">{selectedProduct['Stock Frimoda']}</p>
                          </motion.div>
                          
                          <div className="flex justify-between items-stretch space-x-2">
                            {[
                              { city: 'Casa', color: 'bg-teal-500' },
                              { city: 'Rabat', color: 'bg-amber-500' },
                              { city: 'Marrakech', color: 'bg-rose-500' },
                              { city: 'Tanger', color: 'bg-indigo-500' }
                            ].map(({ city, color }, index) => {
                              const stockValue = selectedProduct[`Stock ${city}`];
                              const isOutOfStock = stockValue === 0;
                              return (
                                <motion.div 
                                  key={city}
                                  className={`${color} ${isOutOfStock ? 'opacity-50' : ''} p-2 rounded-lg flex-grow flex flex-col justify-between relative overflow-hidden`}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.5, delay: (index + 1) * 0.1, type: "spring" }}
                                >
                                  <p className="text-xs font-bold text-white text-center uppercase">{city}</p>
                                  <p className="text-xl font-bold text-center text-white uppercase">
                                    {stockValue}
                                  </p>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <Dialog.Close asChild>
                    <Button 
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 rounded-full transition-colors duration-200"
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseModal();
                      }}
                    >
                      <FiX className="h-6 w-6" />
                    </Button>
                  </Dialog.Close>

                  {/* Tissue/Ceramic Image Overlay */}
                  {tissueImageOverlay && (
                    <div 
                      className="absolute inset-0 bg-black/60 flex items-center justify-center z-10"
                      onClick={() => setTissueImageOverlay(null)}
                    >
                      <div className="relative">
                        <Image
                          src={tissueImageOverlay.src}
                          alt={tissueImageOverlay.alt}
                          width={300}
                          height={300}
                          objectFit="cover"
                          className="rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTissueImageOverlay(null);
                          }}
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1 transition-colors duration-200"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </Dialog.Content>
            )}
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Catalogue Item Modal */}
      <Dialog.Root open={!!openCatalogueItem} onOpenChange={handleCloseCatalogueModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 opacity-0 data-[state=open]:opacity-100 transition-opacity duration-300 z-50" />
          <AnimatePresence>
            {openCatalogueItem && (
              <Dialog.Content className="fixed inset-0 flex items-center justify-center z-[60]" onClick={handleCloseCatalogueModal}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-lg shadow-lg w-[90vw] sm:w-[400px] md:w-[500px] lg:w-[600px] h-[80vh] sm:h-[90vh] max-h-[600px] overflow-hidden flex flex-col relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isCatalogueModalLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Spinner size="large" />
                    </div>
                  ) : (
                    <>
                      <div className="relative flex-grow">
                        <Image 
                          src={openCatalogueItem['image url']}
                          alt={openCatalogueItem.ref}
                          layout="fill"
                          objectFit="cover"
                          className="z-0"
                        />
                      </div>
                      <div className="bg-white bg-opacity-90 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center z-10">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{openCatalogueItem.color ? openCatalogueItem.color.toUpperCase() : openCatalogueItem.ref.toUpperCase()}</h3>
                          {openCatalogueItem.color && <p className="text-sm text-gray-600 mt-1">{openCatalogueItem.ref.toUpperCase()}</p>}
                        </div>
                        <span className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-semibold ${
                          openCatalogueItem.availability === 'yes' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {openCatalogueItem.availability === 'yes' ? 'EN STOCK' : 'ÉPUISÉ'}
                        </span>
                      </div>
                    </>
                  )}
                  <Dialog.Close asChild>
                    <Button className="absolute top-2 right-2 bg-white/50 hover:bg-white/70 text-gray-800 z-20" variant="ghost" size="icon">
                      <FiX className="h-4 w-4" />
                    </Button>
                  </Dialog.Close>
                </motion.div>
              </Dialog.Content>
            )}
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Image Modal */}
      <AnimatePresence>
        {imageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImageModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-lg p-2 shadow-xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                width={300}
                height={300}
                objectFit="cover"
                className="rounded-lg"
              />
              <button
                onClick={closeImageModal}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1 transition-colors duration-200"
              >
                <FiX className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tissue Image Modal */}
      <AnimatePresence>
        {openTissueImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseTissueModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-lg p-2 shadow-xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={openTissueImage.src}
                alt={openTissueImage.alt}
                width={300}
                height={300}
                objectFit="cover"
                className="rounded-lg"
              />
              <button
                onClick={handleCloseTissueModal}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1 transition-colors duration-200"
              >
                <FiX className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}