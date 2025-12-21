/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import Image from 'next/image';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { BiSolidEditAlt } from 'react-icons/bi';
import { useState } from 'react';
import { FaArrowAltCircleDown, FaArrowAltCircleRight } from 'react-icons/fa';
import { MdAddBox, MdDelete } from 'react-icons/md';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAxiosPublic from '@/axios/useAxiosPublic';
import Swal from 'sweetalert2';
import apiClient from '@/axios/axiosInstant';
import toast from 'react-hot-toast';
import { Switch } from '@mui/material';
import AddBanner from '../components/sliders/AddBanner';
import UpdateBanner from '../components/sliders/UpdateBanner';

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

const BannerPage = () => {
  const queryClient = useQueryClient();
  const axiosPublic = useAxiosPublic();
  const [openModalForAdd, setOpenModalForAdd] = useState<boolean>(false);
  const [openModalForUpdate, setOpenModalForUpdate] = useState<boolean>(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  // Fetch all banners with caching
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const response = await axiosPublic.get(`/banners`);
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });

  // Delete banner with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/banners/${id}`);
      return response.data.data;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['banners'] });
      const previousBanners = queryClient.getQueryData<Banner[]>(['banners']);
      
      if (previousBanners) {
        queryClient.setQueryData<Banner[]>(['banners'], 
          previousBanners.filter(banner => banner._id !== id)
        );
      }
      
      return { previousBanners };
    },
    onError: (err, id, context) => {
      if (context?.previousBanners) {
        queryClient.setQueryData(['banners'], context.previousBanners);
      }
      toast.error("Failed to delete banner");
    },
    onSuccess: () => {
      toast.success("Banner deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });

  // Toggle banner status with optimistic updates
  const statusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiClient.patch(`/banners/${id}`, { isActive });
      return response.data.data;
    },
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: ['banners'] });
      const previousBanners = queryClient.getQueryData<Banner[]>(['banners']);
      
      if (previousBanners) {
        queryClient.setQueryData<Banner[]>(['banners'], 
          previousBanners.map(banner => 
            banner._id === id ? { ...banner, isActive } : banner
          )
        );
      }
      
      return { previousBanners };
    },
    onError: (err, variables, context) => {
      if (context?.previousBanners) {
        queryClient.setQueryData(['banners'], context.previousBanners);
      }
      toast.error("Failed to update status");
    },
    onSuccess: () => {
      // Success is handled in the function
    },
  });

  const handleStatusToggle = async (banner: Banner) => {
    const newStatus = !banner.isActive;
    
    try {
      await statusMutation.mutateAsync({ 
        id: banner._id, 
        isActive: newStatus 
      });
      
      toast.success(`Banner ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This banner will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setOpenModalForUpdate(true);
  };

  return (
    <div className='bg-white'>
      {/* Sliders */}
      <div className='relative'>
        {/* Add Banner Slider */}
        <div className={`transition-transform duration-500 w-full lg:w-4/5 shadow-lg h-full z-10 overflow-y-auto fixed ${openModalForAdd ? 'translate-y-0 top-0 bg-gray-100' : 'translate-y-[100%]'} flex justify-center`}>
          <div className='w-full'>
            <AddBanner 
              setOpenModalForAdd={setOpenModalForAdd}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["banners"] });
              }}
            />
          </div>
        </div>

        {/* Update Banner Slider */}
        <div className={`transition-transform duration-500 w-full lg:w-4/5 shadow-lg h-full z-10 overflow-y-auto fixed ${openModalForUpdate ? 'translate-x-0 top-0 bg-gray-100' : 'translate-x-[100%]'} flex justify-center`}>
          <div className='w-full'>
            {selectedBanner && (
              <UpdateBanner
                banner={selectedBanner} 
                setOpenModalForUpdate={setOpenModalForUpdate}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ["banners"] });
                }}
              />
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className='w-full flex justify-center mt-28'>
          <Image alt='loading' src="/Images/loading.gif" height={600} width={800} className='w-[80px] h-[80px]' />
        </div>
      ) : (
        <div>
          {/* Header section */}
          <div className='my-5 flex md:flex-row justify-between items-center gap-3 mx-8'>
            <h1 className='lg:text-4xl text-xl font-semibold text-orange-500'>
              Banner Management
            </h1>
            <button 
              onClick={() => setOpenModalForAdd(!openModalForAdd)} 
              className='active:scale-95 text-xl text-white p-2 bg-blue-600 hover:bg-blue-800 flex gap-1 items-center pl-3 pr-5 rounded'
            >
              <MdAddBox /> Add New Banner
            </button>
          </div>

          {/* Table section */}
          <section className='mx-8 mb-20'>
            <TableContainer component={Paper} sx={{ maxWidth: '100%', marginTop: '20px' }}>
              <Table sx={{ width: '100%', border: "2px solid #e5e7eb" }} aria-label="banner table">
                <TableHead className='bg-blue-50'>
                  <TableRow>
                    <TableCell align='left' className='text-gray-900 font-semibold'>Image</TableCell>
                    <TableCell align='left' className='text-gray-900 font-semibold'>Top Title</TableCell>
                    <TableCell align='left' className='text-gray-900 font-semibold'>Main Title</TableCell>
                    <TableCell align='left' className='text-gray-900 font-semibold'>Bottom Title</TableCell>
                    <TableCell align='left' className='text-gray-900 font-semibold'>Status</TableCell>
                    <TableCell align='left' className='text-gray-900 font-semibold'>Last Updated</TableCell>
                    <TableCell align='left' className='text-gray-900 font-semibold'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {banners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center py-8'>
                        No banners found. Add your first banner!
                      </TableCell>
                    </TableRow>
                  ) : (
                    banners.map((banner: Banner) => (
                      <TableRow 
                        key={banner._id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          <div className='relative w-20 h-12'>
                            <Image 
                              alt='banner' 
                              src={banner.thumbnailImage || "/placeholder-image.jpg"} 
                              fill
                              className='object-cover rounded'
                            />
                          </div>
                        </TableCell>
                        <TableCell align="left">{banner.toptitle || "-"}</TableCell>
                        <TableCell align="left">{banner.title || "-"}</TableCell>
                        <TableCell align="left">
                          <div className='max-w-xs truncate'>{banner.bottomtitle || "-"}</div>
                        </TableCell>
                        <TableCell align="left">
                          <Switch
                            checked={banner.isActive}
                            onChange={() => handleStatusToggle(banner)}
                            color="success"
                          />
                        </TableCell>
                        <TableCell align="left">
                          {new Date(banner.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="left">
                          <div className='flex items-center gap-3'>
                            <button 
                              onClick={() => handleEdit(banner)}
                              className='active:scale-95 text-xl text-white p-2 bg-orange-500 flex gap-1 items-center rounded-full hover:bg-orange-800'
                            >
                              <BiSolidEditAlt />
                            </button>
                            <button
                              onClick={() => handleDelete(banner._id)}
                              className='bg-rose-600 p-2 text-xl rounded-full text-white active:scale-90 hover:bg-red-800'
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </section>
        </div>
      )}
    </div>
  );
};

export default BannerPage;