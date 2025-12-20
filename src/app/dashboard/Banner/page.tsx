/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton,
  Switch, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField,
} from "@mui/material";
import { Edit, Delete, Add, Close } from "@mui/icons-material";
import toast from "react-hot-toast";
import axios from "axios";

interface Banner {
  _id: string;
  thumbnailImage: string;
  title: string;
  toptitle: string;
  bottomtitle: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BannerList() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    thumbnailImage: "",
    toptitle: "",
    title: "",
    bottomtitle: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchBanners();
  }, []);

 const fetchBanners = async () => {
  try {
    setLoading(true);
    const response = await axios.get('/api/banners');
    // If the API returns { data: banners }
    setBanners(response.data.data || response.data || []);
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch banners");
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, thumbnailImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      thumbnailImage: "",
      toptitle: "",
      title: "",
      bottomtitle: "",
    });
    setImageFile(null);
    setImagePreview("");
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.thumbnailImage || !formData.toptitle || !formData.title || !formData.bottomtitle) {
      toast.error("Please fill all required fields");
      return;
    }
    
    try {
      let thumbnailImageUrl = formData.thumbnailImage;
      
      // If image file is selected, upload it
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        
        const uploadResponse = await axios.post('/api/upload', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        thumbnailImageUrl = uploadResponse.data.url;
      }
      
      await axios.post('/api/banners', {
        ...formData,
        thumbnailImage: thumbnailImageUrl
      });
      
      toast.success("Banner added successfully");
      setOpenAddDialog(false);
      resetForm();
      fetchBanners();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add banner");
      console.error(error);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      thumbnailImage: banner.thumbnailImage,
      toptitle: banner.toptitle,
      title: banner.title,
      bottomtitle: banner.bottomtitle,
    });
    setImagePreview(banner.thumbnailImage);
    setOpenEditDialog(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    
    // Validate required fields
    if (!formData.thumbnailImage || !formData.toptitle || !formData.title || !formData.bottomtitle) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      let thumbnailImageUrl = formData.thumbnailImage;
      
      // If new image file is selected, upload it
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        
        const uploadResponse = await axios.post('/api/upload', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        thumbnailImageUrl = uploadResponse.data.url;
      }
      
      await axios.patch(`/api/banners/${editingBanner._id}`, {
        ...formData,
        thumbnailImage: thumbnailImageUrl
      });
      
      toast.success("Banner updated successfully");
      setOpenEditDialog(false);
      resetForm();
      fetchBanners();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update banner");
      console.error(error);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/banners/${id}`, { isActive: !currentStatus });
      toast.success("Status updated successfully");
      fetchBanners();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    
    try {
      await axios.delete(`/api/banners/${id}`);
      toast.success("Banner deleted successfully");
      fetchBanners();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete banner");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Banner Management</h1>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add New Banner
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead className="bg-gray-100">
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Top Title</TableCell>
              <TableCell>Main Title</TableCell>
              <TableCell>Bottom Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No banners found. Add your first banner!
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner._id}>
                  <TableCell>
                    <div className="relative w-24 h-16">
                      <Image
                        src={banner.thumbnailImage}
                        alt={banner.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{banner.toptitle}</TableCell>
                  <TableCell>{banner.title}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">{banner.bottomtitle}</div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={banner.isActive}
                      onChange={() => handleStatusToggle(banner._id, banner.isActive)}
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(banner)}
                        className="text-blue-600"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(banner._id)}
                        className="text-red-600"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Banner Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <span>Add New Banner</span>
          <IconButton onClick={() => setOpenAddDialog(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent>
            <div className="space-y-4 py-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image *
                </label>
                {imagePreview ? (
                  <div className="relative w-full h-48 mb-4">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setImagePreview("");
                        setImageFile(null);
                        setFormData(prev => ({ ...prev, thumbnailImage: "" }));
                      }}
                      className="absolute top-2 right-2 bg-white"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="add-image-upload"
                    />
                    <label htmlFor="add-image-upload" className="cursor-pointer">
                      <div className="text-4xl text-gray-400 mb-2">📷</div>
                      <p className="text-gray-600">Click to upload banner image</p>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </label>
                  </div>
                )}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Or enter image URL:</p>
                  <TextField
                    fullWidth
                    name="thumbnailImage"
                    value={formData.thumbnailImage}
                    onChange={handleInputChange}
                    placeholder="https://example.com/banner-image.jpg"
                    disabled={!!imagePreview}
                  />
                </div>
              </div>

              <TextField
                fullWidth
                label="Top Title *"
                name="toptitle"
                value={formData.toptitle}
                onChange={handleInputChange}
                placeholder="Enter top title (small text above main title)"
                required
              />

              <TextField
                fullWidth
                label="Main Title *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter main title"
                required
              />

              <TextField
                fullWidth
                label="Bottom Title/Description *"
                name="bottomtitle"
                value={formData.bottomtitle}
                onChange={handleInputChange}
                placeholder="Enter description or bottom title"
                multiline
                rows={3}
                required
              />
            </div>
          </DialogContent>
          <DialogActions className="p-4">
            <Button onClick={() => setOpenAddDialog(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Banner
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <span>Edit Banner</span>
          <IconButton onClick={() => setOpenEditDialog(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleUpdate}>
          <DialogContent>
            <div className="space-y-4 py-4">
              {/* Image Upload for Edit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image *
                </label>
                {imagePreview ? (
                  <div className="relative w-full h-48 mb-4">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setImagePreview("");
                        setImageFile(null);
                        setFormData(prev => ({ 
                          ...prev, 
                          thumbnailImage: editingBanner?.thumbnailImage || "" 
                        }));
                      }}
                      className="absolute top-2 right-2 bg-white"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="relative w-full h-48 mb-4">
                    <Image
                      src={editingBanner?.thumbnailImage || ""}
                      alt="Current"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e: any) => handleImageChange(e);
                        input.click();
                      }}
                      className="absolute top-2 right-2 bg-white"
                    >
                      Change
                    </Button>
                  </div>
                )}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Or enter image URL:</p>
                  <TextField
                    fullWidth
                    name="thumbnailImage"
                    value={formData.thumbnailImage}
                    onChange={handleInputChange}
                    placeholder="https://example.com/banner-image.jpg"
                    disabled={!!imagePreview}
                  />
                </div>
              </div>

              <TextField
                fullWidth
                label="Top Title *"
                name="toptitle"
                value={formData.toptitle}
                onChange={handleInputChange}
                required
              />

              <TextField
                fullWidth
                label="Main Title *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />

              <TextField
                fullWidth
                label="Bottom Title/Description *"
                name="bottomtitle"
                value={formData.bottomtitle}
                onChange={handleInputChange}
                multiline
                rows={3}
                required
              />
            </div>
          </DialogContent>
          <DialogActions className="p-4">
            <Button onClick={() => setOpenEditDialog(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update Banner
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}