"use client";
import Image from "next/image";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { BiSolidEditAlt } from "react-icons/bi";
import { useState } from "react";
import {
  FaArrowAltCircleDown,
  FaArrowAltCircleRight,
  FaFileExcel,
} from "react-icons/fa";
import { MdAddBox, MdDelete } from "react-icons/md";
import { Pagination, Stack } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPublic from "@/axios/useAxiosPublic";
import apiClient from "@/axios/axiosInstant";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import { TPhotoCard } from "@/types/types";
import AddNewPhotoCard from "./_components/AddNewPhotoCard";
import UpdatePhotoCard from "./_components/UpdatePhotoCard";

const PhotoCard = () => {
  const [updatephotoCardId, setUpdatephotoCardId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;
  const queryClient = useQueryClient();
  const axiosPublic = useAxiosPublic();
  const [openModalForAdd, setOpenModalForAdd] = useState<boolean>(false);
  const [openModalForUpdate, setOpenModalForUpdate] = useState<boolean>(false);

  //  getting gallery
  const { data: photoCardData = { data: [], totalCount: 0 }, isLoading } =
    useQuery({
      queryKey: ["photoCards", currentPage],
      queryFn: async () => {
        const response = await axiosPublic.get(
          `/photoCards?page=${currentPage}&limit=${limit}`
        );
        return response.data.data;
      },
    });

  const { data, totalCount } = photoCardData;

  // delete gallery
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`photoCards/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photoCards"] });
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to Delete Gallery");
    },
  });

  return (
    <div className="bg-white">
      <div className="relative ">
        {/* slider for add info  */}
        <div
          className={`transition-transform duration-500 w-full lg:w-4/5  shadow-lg h-full z-10 overflow-y-auto  fixed ${
            openModalForAdd
              ? "translate-y-0 top-[60px] bg-gray-100"
              : "translate-y-[100%] "
          } flex justify-center  bg-[url(/Images/bg-image-modal-2.jpg)]   bg-cover bg-center`}
        >
          <div className="mt-8">
            <button
              onClick={() => setOpenModalForAdd(!openModalForAdd)}
              className="text-rose-600 px-3 absolute top-0 left-0 py-1 border border-rose-600 flex flex-row active:scale-95 gap-2 item-center justify-center bg-white"
            >
              <span className=" text-xl">
                <FaArrowAltCircleDown />
              </span>{" "}
              <p>Back</p>
            </button>
            <AddNewPhotoCard setOpenModalForAdd={setOpenModalForAdd}/>
          </div>
        </div>
        {/* slider for update  info  */}
        <div
          className={`transition-transform duration-500 w-full lg:w-4/5   shadow-lg h-full z-10 overflow-y-auto  fixed ${
            openModalForUpdate
              ? "translate-x-0 top-[60px] bg-gray-100"
              : "translate-x-[100%] "
          } flex justify-center   bg-[url(/Images/bg-image-modal-2.jpg)]   bg-cover bg-center`}
        >
          <div className="mt-8">
            <button
              onClick={() => {
                setOpenModalForUpdate(!openModalForUpdate);
                location.reload();
              }}
              className="text-rose-600 px-3 py-1 border border-rose-600 flex flex-row active:scale-95 gap-2 item-center justify-center bg-white absolute left-0 top-0"
            >
              <span className="  text-xl ">
                <FaArrowAltCircleRight />
              </span>{" "}
              <p>Back</p>
            </button>
            <UpdatePhotoCard
              photoCardId={updatephotoCardId}
              setOpenModalForUpdate={setOpenModalForUpdate}
            />
          </div>
        </div>
      </div>

      {/* header section  */}
      <div className="mt-5  flex  md:flex-row justify-between items-center gap-3 mx-8">
        <h1 className="lg:text-4xl text-xl font-semibold text-orange-500 ">
          Gallery
        </h1>
        <button
          onClick={() => setOpenModalForAdd(!openModalForAdd)}
          className=" active:scale-95 text-xl text-white  p-1 bg-gray-600 hover:bg-slate-800 flex gap-1 items-center pl-3 pr-5"
        >
          <MdAddBox />
          Add New Photo
        </button>
      </div>

      {/* table section  */}
      <section className="mx-8  ">
        {isLoading ? (
          <div className="w-full flex justify-center mt-28">
            <Image
              alt="photo"
              src="/Images/loading.gif"
              height={600}
              width={800}
              className="w-[80px] h-[80px] "
            />
          </div>
        ) : (
          <section className="flex justify-center item-center  px-5 py-8  ">
            {data?.length === 0 ? (
              <div className="flex flex-col items-center px-5 my-24">
                <FaFileExcel className="text-6xl" />
                <p className="text-2xl">No Photos available.</p>
              </div>
            ) : (
              <TableContainer component={Paper} sx={{ maxWidth: "100%" }}>
                <Table
                  sx={{ width: "100%", border: "2px solid gray" }}
                  aria-label="simple table"
                >
                  <TableHead className="bg-blue-200 border-b-2 border-gray-600">
                    <TableRow>
                      <TableCell
                        align="left"
                        className="text-gray-900 font-semibold"
                      >
                        Photo
                      </TableCell>
                      <TableCell
                        align="left"
                        className="text-gray-900 font-semibold"
                      >
                        Title
                      </TableCell>
                      <TableCell
                        align="left"
                        className="text-gray-900 font-semibold"
                      >
                        {" "}
                        Date
                      </TableCell>
                      <TableCell
                        align="left"
                        className="text-gray-900 font-semibold"
                      >
                        Creation Date
                      </TableCell>
                      <TableCell
                        align="left"
                        className="text-gray-900 font-semibold"
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.map((row: TPhotoCard, idx: number) => (
                      <TableRow
                        key={idx}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Image
                            alt="video"
                            src={row.imageUrl}
                            className="w-[60px] h-[60px]"
                            width={60}
                            height={60}
                          />
                        </TableCell>
                        <TableCell align="left">
                          {row.title.slice(0, 30)}...
                        </TableCell>
                        <TableCell align="left">
                          {new Date(row.date).toDateString()}
                        </TableCell>
                        <TableCell align="left">
                          {new Date(row.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="left">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setOpenModalForUpdate(!openModalForUpdate);
                                setUpdatephotoCardId(row._id);
                              }}
                              className=" active:scale-95 text-xl text-white  p-1 bg-orange-500 flex gap-1 items-center rounded-full hover:bg-orange-800"
                            >
                              <BiSolidEditAlt />
                            </button>
                            <button
                              onClick={() =>
                                Swal.fire({
                                  title: "Are you sure?",
                                  showCancelButton: true,
                                  confirmButtonColor: "#3085d6",
                                  cancelButtonColor: "#d33",
                                  confirmButtonText: "Yes, delete it!",
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    deleteMutation.mutate(row._id);
                                    Swal.fire({
                                      title: "Deleted!",
                                      text: "Your file has been deleted.",
                                      icon: "success",
                                    });
                                  }
                                })
                              }
                              className="bg-rose-600 p-1 text-xl rounded-full text-white active:scale-90 hover:bg-red-800"
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </section>
        )}
      </section>

      {/* pagination buttons */}
      {totalCount < limit && currentPage === 1 ? (
        ""
      ) : (
        <div className="flex item-center justify-center mb-20 mt-8">
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(totalCount / limit)}
              page={currentPage}
              onChange={(event, value) => setCurrentPage(value)}
              color="primary"
            />
          </Stack>
        </div>
      )}
    </div>
  );
};

export default PhotoCard;
