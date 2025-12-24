/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Drawer } from '@mui/material';
import React, { useEffect, useState } from 'react';
import UploadImageSlider from './uploadImageSlider/UploadImageSlider';
import useAxiosPublic from '@/axios/useAxiosPublic';
import Image from 'next/image';
import { CiEdit } from 'react-icons/ci';
import apiClient from '@/axios/axiosInstant';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TGallery } from '@/types/types';

interface UpdateGalleryInfoProps {
  galleryId: string;
  setOpenModalForUpdate:(value:boolean)=>void
}

const UpdateArticleInfo: React.FC<UpdateGalleryInfoProps> = ({ galleryId,setOpenModalForUpdate }) => {
  const queryClient = useQueryClient();
  const [gallery, setGallery] = useState<TGallery | null>(null);
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [photoId, setPhotoId] = useState('');
  const axiosPublic = useAxiosPublic();

  const toggleDrawer = (newOpen: boolean) => setOpen(newOpen);

  useEffect(() => {
    if (!galleryId) return;

    const getEventData = async () => {
      try {
        const response = await axiosPublic.get(`/gallery/${galleryId}`);
        setGallery(response.data.data);
        setImageUrl(response.data.data.imageUrl);
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    };

    getEventData();
  }, [galleryId, axiosPublic]);

  useEffect(() => {
    if (!photoId) return;

    const fetchPhotoData = async () => {
      try {
        const response = await axiosPublic.get(`/photos/${photoId}`);
        setImageUrl(response?.data?.data?.imageUrl);
      } catch (error) {
        console.error('Error fetching photo data:', error);
      }
    };

    fetchPhotoData();
  }, [photoId, axiosPublic]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TGallery> }) => {
      const response = await apiClient.patch(`/gallery/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      toast.success('Gallery Photo Updated Successfully');
      setOpenModalForUpdate(false)
    },
    onError: (error: any) => {
      toast.error(error.response.data.message||'Failed to update Gallery Photo');
      console.error('Update error:', error);
    },
  });

  const handleSubmit = (e: { preventDefault: () => void; target: any; } ) => {
    e.preventDefault();
    const form = e.target;

    const data: Partial<TGallery> = {
      title: form.title.value,
      date: form.date.value,
      imageUrl,
    };

    updateMutation.mutate({ id:galleryId, data });
    form.reset();

  };

  return (
    <div className="h-full min-h-[500px] text-black">
      <div>
        <Drawer open={open} onClose={() => toggleDrawer(false)}>
          <UploadImageSlider photoId={setPhotoId} toggleDrawer={toggleDrawer} />
        </Drawer>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl 2xl:mt-28 px-6 pt-10 flex flex-col gap-10 justify-between items-center pb-20 text-black">
          <section className="flex flex-col lg:flex-row gap-16">
            {/* Left Panel: Image, Title, , Date */}
            <div className="flex flex-col gap-[20px]">
              <div className="w-full flex justify-center">
                {photoId ? (
                  <div className="w-[150px] h-[150px] rounded-full relative">
                   <CiEdit
                      className="absolute text-red-600 text-4xl hover:text-red-800 active:scale-90 right-0 top-0 bg-white rounded-full"
                      onClick={() => toggleDrawer(true)}
                    />
                    <Image
                      alt="Event Photo"
                      src={imageUrl as string}
                      height={600}
                      width={800}
                      className="w-[150px] h-[150px] rounded-full"
                    />
                  </div>
                ) : (
                  <div className="w-[150px] h-[150px] rounded-full relative">
                    <CiEdit
                      className="absolute text-red-600 text-4xl hover:text-red-800 active:scale-90 right-0 top-0 bg-white rounded-full"
                      onClick={() => toggleDrawer(true)}
                    />
                    <Image
                      alt="Event Placeholder"
                      src={gallery?.imageUrl || '/placeholder.jpg'}
                      height={600}
                      width={800}
                      className="w-[150px] h-[150px] rounded-full"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="title">Title</label>
                <input
             
                  defaultValue={gallery?.title}
                  name="title"
                  className="md:w-[350px] px-5 py-3 border outline-blue-400 w-[250px] bg-white"
                  type="text"
                />
              </div>

             

              <label htmlFor="Date">
                <p className="text-gray-950 mb-1">Select Date</p>
                <input
                  name="date"
                  defaultValue={
                    gallery?.date && !isNaN(new Date(gallery?.date).getTime())
                      ? new Date(gallery?.date).toISOString().split('T')[0]
                      : ''
                  }
                  type="date"
                  className="md:w-[350px] w-[250px] bg-white py-3 text-gray-700 px-3"
                />
              </label>
            </div>

          
          </section>

          <input
        
            type="submit"
            value="Submit"
            className="md:w-[350px] text-white w-[250px] bg-orange-600 py-2 px-3 active:scale-95 lg:w-full"
          />
        </div>
      </form>
    </div>
  );
};

export default UpdateArticleInfo;










// import { TextField } from '@mui/material';
// import React, { useState } from 'react';
// import { MdAddAPhoto } from 'react-icons/md';


// const UpdatePhotoInfo = () => {
//   const [fileName,setFileName] = useState('/Images/profile-preview.png');

//   const handleFileChange =(e:React.ChangeEvent<HTMLInputElement>)=>{
//     if(e.target.files && e.target.files.length>0){
//       const file = e.target.files[0];
//       setFileName(file.name);
//     }
//     else{
//       setFileName('/Images/profile-preview.png')
//     }

//   }
//   return (
//     <div className=' h-full min-h-[500px] '>
//      <div className='max-w-4xl px-6 pt-10 flex flex-col  gap-10 justify-between items-center pb-20'>    
//      <label htmlFor="upload video border">
//     <div onClick={()=>document.getElementById('upload_image')?.click()} className='flex items-center flex-col justify-center p-5 border-2 bg-white'>
//     <MdAddAPhoto className='text-5xl mb-2'/>
//     <p>Upload Photo</p>
//     <p className='bg-slate-300 px-2 py-1 mt-2'>{fileName}</p>
//     </div>
//       <input onChange={handleFileChange} className='relative hidden left-12' type="file" name="image" id="upload_image" />
//    </label>
     
//      <TextField 
//      defaultValue={'Independent Day'}
//      className='md:w-[350px] w-[250px] bg-white' id="outlined-basic" label="Title" variant="outlined" />
//      <label htmlFor="date">
//       <p className='text-gray-950 mb-1 '>Select Date</p>
//      <input type="date" name="date" id="date" className='md:w-[350px] w-[250px] bg-white text-gray-700 py-2 px-3'/>
//      </label>
   
      
//       <input type="submit" value="Update" className='md:w-[350px] text-white w-[250px] bg-[#3D93C1] py-2 px-3 active:scale-95' />  
//      </div>
//     </div>
//   );
// };

// export default UpdatePhotoInfo;