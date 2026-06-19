import React, { useState, useEffect } from 'react';
import { useProductContext } from '../context/ProductContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Papa from 'papaparse';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

interface ProductManagementPageProps {
  onEdit: (productId: string) => void;
}

const pageSize = 10;

const ProductManagementPage: React.FC<ProductManagementPageProps> = ({ onEdit }) => {
  const { products, loading, reloadProducts } = useProductContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const pageFromUrl = Number(searchParams.get('page')) || 1;
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setSearchParams({ page: currentPage.toString() });
  }, [currentPage, setSearchParams]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentPage < totalPages) {
        setCurrentPage(p => p + 1);
      }
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage(p => p - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentPage, totalPages]);

  const toggleSelectAll = () => {
    const idsOnPage = paginatedProducts.map(p => p._id);
    if (selectAll) {
      setSelectedProducts(prev => prev.filter(id => !idsOnPage.includes(id)));
    } else {
      setSelectedProducts(prev => Array.from(new Set([...prev, ...idsOnPage])));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/api/products/${productId}`);
      toast.success('Product deleted');
      reloadProducts();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm('Delete selected products?')) return;
    try {
      await Promise.all(selectedProducts.map(id => axios.delete(`${API_URL}/api/products/${id}`)));
      toast.success('Selected products deleted');
      setSelectedProducts([]);
      reloadProducts();
    } catch {
      toast.error('Bulk delete failed');
    }
  };

  const handleCSVExport = () => {
    const csv = Papa.unparse(products.map(p => ({
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      description: p.description,
      image: p.image,
      extraImages: p.extraImages?.join(',') || '',
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          await Promise.all(
            rows.map(async (row) => {
              const product = {
                name: row.name,
                category: row.category,
                price: Number(row.price),
                stock: Number(row.stock),
                description: row.description,
                image: row.image,
                extraImages: row.extraImages?.split(',') || [],
              };
              await axios.post(`${API_URL}/api/products`, product);
            })
          );
          toast.success('Bulk upload complete');
          reloadProducts();
        } catch {
          toast.error('Bulk upload failed');
        }
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-screen-xl mx-auto">
      {/* Tabs at the Top */}
      <div className="flex gap-4 border-b pb-3 mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="text-gray-500 hover:text-blue-600"
        >
          Add Product
        </button>
        <button
          className="text-blue-600 border-b-2 border-blue-600 font-semibold"
        >
          Manage Products
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">Product Management</h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <input
          type="text"
          placeholder="Search for a product..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
          <button
            onClick={handleCSVExport}
            className="bg-green-600 text-white px-3 py-2 rounded"
          >
            Export CSV
          </button>

          <label className="cursor-pointer text-center bg-blue-600 text-white px-3 py-2 rounded">
            Upload CSV
            <input type="file" accept=".csv" onChange={handleCSVUpload} hidden />
          </label>

          <button
            onClick={handleBulkDelete}
            className="bg-red-600 text-white px-3 py-2 rounded disabled:opacity-50"
            disabled={selectedProducts.length === 0}
          >
            Delete Selected ({selectedProducts.length})
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto w-full">
            <table className="min-w-[700px] w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">
                    <input
                      type="checkbox"
                      checked={paginatedProducts.every(p => selectedProducts.includes(p._id))}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="py-2 px-4 border-b">Image</th>
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Category</th>
                  <th className="py-2 px-4 border-b">Price</th>
                  <th className="py-2 px-4 border-b">Stock</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(product => (
                  <tr key={product._id}>
                    <td className="py-2 px-4 border-b text-center">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleSelectProduct(product._id)}
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                    </td>
                    <td className="py-2 px-4 border-b">{product.name}</td>
                    <td className="py-2 px-4 border-b">{product.category}</td>
                    <td className="py-2 px-4 border-b">{product.price}</td>
                    <td className="py-2 px-4 border-b">{product.stock}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => onEdit(product._id)}
                        className="text-blue-500 hover:underline mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1 rounded ${currentPage === idx + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
                  }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductManagementPage;
