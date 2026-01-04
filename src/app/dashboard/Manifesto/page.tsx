"use client";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/axios/axiosInstant";
import useAxiosPublic from "@/axios/useAxiosPublic";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { TManifesto } from "@/types/types";
import { BiSolidEditAlt, BiDownload } from "react-icons/bi";
import { MdDelete,  MdOutlinePictureAsPdf } from "react-icons/md";
import { Pagination, Stack } from "@mui/material";
import React from "react";


const ManifestoList = () => {
  const [page, setPage] = React.useState(1);
  const limit = 6;
  const queryClient = useQueryClient();
  const axiosPublic = useAxiosPublic();

  const { data: responseData, isLoading } = useQuery({
    queryKey: ["manifestos", page],
    queryFn: async () => {
      const res = await axiosPublic.get(`/manifestos`);
      return res.data.data;
    },
  });

  const data = responseData?.data || [];
  const totalCount = responseData?.totalCount || 0;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/manifestos/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manifestos"] });
      toast.success("Manifesto deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete manifesto");
    },
  });

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manifestos</h1>
          <p className="text-gray-600 mt-1">Manage all political manifestos and documents</p>
        </div>
        {/* <Link href="/dashboard/Manifesto/AddManifesto">
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
            <MdAddBox className="text-xl" />
            Add New Manifesto
          </button>
        </Link> */}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <Image src="/Images/loading.gif" alt="loading" width={100} height={100} />
          <p className="text-gray-500 mt-4">Loading manifestos...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center mt-20 bg-white p-10 rounded-xl shadow-sm border">
          <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
            <MdOutlinePictureAsPdf className="text-5xl text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Manifestos Available</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first manifesto</p>
          <Link href="/dashboard/Manifesto/AddManifesto">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium">
              Create Manifesto
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Photo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Short Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      PDF Documents
                    </th>
                   
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.map((m: TManifesto) => (
                    <tr
                      key={m._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-center">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                            <Image
                              src={m.imageUrl}
                              alt={m.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                            {m.title}
                          </h4>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {m.shortDescription}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {m.pdfLinks && m.pdfLinks.length > 0 ? (
                          <div className="space-y-1">
                            {m.pdfLinks.slice(0, 2).map((pdf, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 p-1.5 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                              >
                                <BiDownload className="text-blue-600 flex-shrink-0" />
                                <a
                                  href={pdf.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                                  title={pdf.name}
                                >
                                  {pdf.name.length > 30
                                    ? `${pdf.name.substring(0, 30)}...`
                                    : pdf.name}
                                </a>
                              </div>
                            ))}
                            {m.pdfLinks.length > 2 && (
                              <p className="text-xs text-gray-500">
                                +{m.pdfLinks.length - 2} more documents
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No PDFs</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/Manifesto/UpdateManifesto/${m._id}`}>
                            <button
                              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow"
                              title="Edit"
                            >
                              <BiSolidEditAlt />
                              Edit
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(m._id)}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow"
                            title="Delete"
                            disabled={deleteMutation.isPending}
                          >
                            <MdDelete />
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalCount > limit && (
            <div className="flex justify-center mt-8 bg-white p-4 rounded-xl shadow-sm border">
              <Stack spacing={2}>
                <Pagination
                  count={Math.ceil(totalCount / limit)}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManifestoList;