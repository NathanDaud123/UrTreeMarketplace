import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Plus, Package, TrendingUp, Upload, X, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { ProductCategory, Product } from '../App';
import { useDatabaseContext } from '../utils/database-provider';

export function SellerDashboard() {
  const { sellerProducts, loadSellerProducts, createProduct, updateProduct, deleteProduct, isLoading } = useDatabaseContext();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productCategory, setProductCategory] = useState<ProductCategory | ''>('');
  const [plantAge, setPlantAge] = useState<'<1thn' | '1thn+' | '3thn+' | ''>('');
  const [maxRadius, setMaxRadius] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load seller products on mount
  useEffect(() => {
    loadSellerProducts();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log('Image upload started, files:', files?.length);
    
    if (files && files.length > 0) {
      setIsUploadingImages(true);
      const newImages: string[] = [];
      const maxFiles = Math.min(files.length, 5 - productImages.length);
      
      console.log(`Processing ${maxFiles} files...`);
      toast.info(`Mengupload ${maxFiles} gambar...`);
      
      try {
        for (let i = 0; i < maxFiles; i++) {
          const file = files[i];
          if (file.type.startsWith('image/')) {
            // Convert to base64 data URL for storage
            const reader = new FileReader();
            const imagePromise = new Promise<string>((resolve) => {
              reader.onloadend = () => {
                resolve(reader.result as string);
              };
              reader.readAsDataURL(file);
            });
            
            const imageUrl = await imagePromise;
            newImages.push(imageUrl);
          }
        }
        
        if (newImages.length > 0) {
          setProductImages([...productImages, ...newImages]);
          toast.success(`${newImages.length} gambar berhasil ditambahkan`);
          console.log(`Successfully uploaded ${newImages.length} images`);
        } else {
          toast.error('Tidak ada gambar valid yang diupload');
        }
      } catch (error) {
        console.error('Error uploading images:', error);
        toast.error('Gagal mengupload gambar');
      } finally {
        setIsUploadingImages(false);
        // Reset input untuk memungkinkan upload file yang sama
        e.target.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    console.log('Removing image at index:', index);
    const newImages = productImages.filter((_, i) => i !== index);
    setProductImages(newImages);
    toast.success('Gambar berhasil dihapus');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductDescription(product.description);
    setProductPrice(product.price.toString());
    setProductStock(product.stock.toString());
    setProductCategory(product.category);
    setPlantAge(product.plantAge || '');
    setMaxRadius(product.maxDeliveryRadius?.toString() || '');
    setProductImages(product.images);
    setAgreedToTerms(true);
    setShowAddProduct(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete);
      toast.success('Produk berhasil dihapus');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Delete product error:', error);
      toast.error('Gagal menghapus produk');
    }
  };

  const confirmDelete = (productId: string) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductStock('');
    setProductCategory('');
    setPlantAge('');
    setMaxRadius('');
    setProductImages([]);
    setAgreedToTerms(false);
    setEditingProduct(null);
  };

  const handleSubmitProduct = async () => {
    console.log('=== Starting product submission ===');
    
    // Validation
    if (!productName || !productDescription || !productPrice || !productStock || !productCategory) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      console.error('Validation failed: Missing required fields');
      return;
    }

    if (productImages.length === 0) {
      toast.error('Mohon upload minimal 1 gambar produk');
      console.error('Validation failed: No images uploaded');
      return;
    }

    // Special validation for tanaman hidup
    if (productCategory === 'tanaman-hidup') {
      if (!plantAge || !maxRadius) {
        toast.error('Untuk Tanaman Hidup, wajib mengisi Usia Tanaman dan Radius Pengiriman');
        console.error('Validation failed: Missing plant age or delivery radius');
        return;
      }
    }

    if (!agreedToTerms) {
      toast.error('Harap setujui Syarat & Ketentuan untuk melanjutkan');
      console.error('Validation failed: Terms not agreed');
      return;
    }

    try {
      const productData = {
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        stock: parseInt(productStock),
        category: productCategory,
        images: productImages,
        plantAge: productCategory === 'tanaman-hidup' ? plantAge : undefined,
        maxDeliveryRadius: productCategory === 'tanaman-hidup' ? parseInt(maxRadius) : undefined,
      };

      console.log('Product data to submit:', {
        ...productData,
        images: `[${productData.images.length} images]`
      });

      if (editingProduct) {
        console.log('Updating product:', editingProduct.id);
        await updateProduct(editingProduct.id, productData);
        toast.success('Produk berhasil diperbarui!');
      } else {
        console.log('Creating new product...');
        await createProduct(productData);
        toast.success('Produk berhasil ditambahkan ke katalog toko!');
      }

      // Reset form
      resetForm();
      setShowAddProduct(false);
      console.log('=== Product submission completed successfully ===');
    } catch (error: any) {
      console.error('Submit product error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      
      const errorMessage = error.message || 'Gagal menyimpan produk';
      toast.error(`Gagal menyimpan produk: ${errorMessage}`);
    }
  };

  const stats = {
    totalProducts: sellerProducts.length,
    totalSales: sellerProducts.reduce((sum, p) => sum + p.sold, 0),
    revenue: sellerProducts.reduce((sum, p) => sum + p.price * p.sold, 0),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2>Dashboard Penjual</h2>
          <p className="text-gray-600">Kelola produk dan toko Anda</p>
        </div>
        <Button onClick={() => setShowAddProduct(!showAddProduct)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Produk Baru
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl">{stats.totalProducts}</div>
                <div className="text-sm text-gray-600">Total Produk</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl">{stats.totalSales}</div>
                <div className="text-sm text-gray-600">Produk Terjual</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <div className="text-2xl">Rp {(stats.revenue / 1000000).toFixed(1)}jt</div>
                <div className="text-sm text-gray-600">Total Pendapatan</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={showAddProduct ? 'add' : 'products'} value={showAddProduct ? 'add' : 'products'}>
        <TabsList>
          <TabsTrigger value="products" onClick={() => setShowAddProduct(false)}>
            Katalog Produk
          </TabsTrigger>
          <TabsTrigger value="add" onClick={() => setShowAddProduct(true)}>
            Tambah Produk
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Katalog Produk Saya</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sellerProducts.map((product) => (
                  <div key={product.id} className="flex gap-4 p-4 border rounded-lg">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4>{product.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">
                              {product.category === 'tanaman-hidup' && 'Tanaman Hidup'}
                              {product.category === 'benih' && 'Benih'}
                              {product.category === 'peralatan' && 'Peralatan'}
                            </Badge>
                            {product.plantAge && (
                              <Badge variant="outline">{product.plantAge}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-600">
                            Rp {product.price.toLocaleString('id-ID')}
                          </div>
                          <div className="text-sm text-gray-600">Stok: {product.stock}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>⭐ {product.rating} ({product.reviews} ulasan)</span>
                        <span>•</span>
                        <span>{product.sold} terjual</span>
                        {product.maxDeliveryRadius && (
                          <>
                            <span>•</span>
                            <span>📍 Radius {product.maxDeliveryRadius} km</span>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          onClick={() => handleEditProduct(product)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => confirmDelete(product.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-4">
                <h3>Gambar Produk</h3>
                <div className="space-y-2">
                  <Label>Upload Gambar (Maks. 5 gambar) *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {productImages.map((image, index) => (
                      <div key={index} className="relative aspect-square border-2 border-gray-200 rounded-lg overflow-hidden group hover:border-gray-400 transition-all">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Delete button clicked for index:', index);
                            handleRemoveImage(index);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 z-10 cursor-pointer"
                          title="Hapus gambar"
                          aria-label="Hapus gambar"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs text-center py-1.5 font-medium">
                            Gambar Utama
                          </div>
                        )}
                      </div>
                    ))}
                    {productImages.length < 5 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log('Upload button clicked');
                          fileInputRef.current?.click();
                        }}
                        disabled={isUploadingImages}
                        className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 active:bg-green-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Upload gambar produk"
                        aria-label="Upload gambar produk"
                      >
                        {isUploadingImages ? (
                          <>
                            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-2"></div>
                            <span className="text-xs text-gray-500">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-green-500 mb-2 transition-colors" />
                            <span className="text-xs text-gray-500">Upload</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      • Gambar pertama akan menjadi gambar utama produk
                    </p>
                    <p className="text-sm text-gray-600">
                      • Klik tombol ❌ pada gambar untuk menghapusnya
                    </p>
                    <p className="text-sm text-gray-500">
                      • Format: JPG, PNG, JPEG (Maks 5 gambar)
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Details */}
              <div className="space-y-4">
                <h3>Detail Dasar Produk</h3>
                <div>
                  <Label htmlFor="name">Nama Produk *</Label>
                  <Input
                    id="name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Contoh: Monstera Deliciosa"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Deskripsi Produk *</Label>
                  <Textarea
                    id="description"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Deskripsikan produk Anda secara detail..."
                    rows={4}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Harga (Rp) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="150000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stok *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={productStock}
                      onChange={(e) => setProductStock(e.target.value)}
                      placeholder="25"
                    />
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-4">
                <h3>Kategori Produk</h3>
                <div>
                  <Label>Pilih Kategori *</Label>
                  <Select
                    value={productCategory}
                    onValueChange={(value) => {
                      setProductCategory(value as ProductCategory);
                      // Reset category-specific fields
                      setPlantAge('');
                      setMaxRadius('');
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Pilih kategori produk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tanaman-hidup">Tanaman Hidup</SelectItem>
                      <SelectItem value="benih">Benih</SelectItem>
                      <SelectItem value="peralatan">Peralatan dan Media Tanam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Special Fields for Tanaman Hidup */}
              {productCategory === 'tanaman-hidup' && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-green-900">Atribut Khusus Tanaman Hidup</h3>
                  <div>
                    <Label>Usia Tanaman *</Label>
                    <Select value={plantAge} onValueChange={(value) => setPlantAge(value as any)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Pilih usia tanaman" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<1thn">Kurang dari 1 tahun</SelectItem>
                        <SelectItem value="1thn+">1 tahun lebih</SelectItem>
                        <SelectItem value="3thn+">3 tahun lebih</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="radius">Radius Pengiriman Maksimum (km) *</Label>
                    <Input
                      id="radius"
                      type="number"
                      value={maxRadius}
                      onChange={(e) => setMaxRadius(e.target.value)}
                      placeholder="Contoh: 100"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Jarak maksimal pengiriman dari lokasi toko Anda
                    </p>
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3>Syarat & Ketentuan</h3>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm cursor-pointer">
                    Saya setuju dengan Syarat & Ketentuan dan Regulasi yang berlaku di UrTree
                    Marketplace. Saya bertanggung jawab atas kebenaran informasi produk yang saya
                    tambahkan.
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={handleSubmitProduct}
                  disabled={!agreedToTerms || isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan & Publikasikan Produk'}
                </Button>
                <Button
                  onClick={() => {
                    resetForm();
                    setShowAddProduct(false);
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
