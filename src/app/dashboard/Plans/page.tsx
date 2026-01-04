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
import { FaFileExcel } from "react-icons/fa";
import { MdAddBox, MdDelete } from "react-icons/md";
import { Pagination, Stack } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPublic from "@/axios/useAxiosPublic";
import apiClient from "@/axios/axiosInstant";
import toast from "react-hot-toast";
import { TPlan } from "@/types/types";
import Swal from "sweetalert2";
import Link from "next/link";

const Plans = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;
  const queryClient = useQueryClient();
  const axiosPublic = useAxiosPublic();

  //  getting plans
  const { data: plansData = { data: [], totalCount: 0 }, isLoading } =
    useQuery({
      queryKey: ["plans", currentPage],
      queryFn: async () => {
        const response = await axiosPublic.get(
          `/plans?page=${currentPage}&limit=${limit}`
        );
        return response.data.data;
      },
    });

  const { data, totalCount } = plansData;

  // delete plan
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`plans/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Delete Plan Successfully");
    },
    onError: (error) => {
      alert(`Error for deleting image: ${error}`);
      toast.error("Failed to Delete Plan");
    },
  });

  return (
    <div className="bg-white">
      <div className="relative "></div>

      {/* header section  */}
      <div className="mt-5  flex  md:flex-row justify-between items-center gap-3 mx-8">
        <h1 className="lg:text-4xl text-xl font-semibold text-orange-500 ">
          plans
        </h1>
        <Link href={"/dashboard/Plans/AddPlan"}>
          <button className=" active:scale-95 text-xl text-white  p-1 bg-gray-600 hover:bg-slate-800 flex gap-1 items-center pl-3 pr-5">
            <MdAddBox />
            Add New Plan
          </button>
        </Link>
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
            {data.length === 0 ? (
              <div className="flex flex-col items-center px-5 my-24">
                <FaFileExcel className="text-6xl" />
                <p className="text-2xl">No Plans available.</p>
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
                        Short Description
                      </TableCell>
                      <TableCell
                        align="left"
                        className="text-gray-900 font-semibold"
                      >
                        Date
                      </TableCell>
                      <TableCell
                        align="left"
                        className="text-gray-900 font-semibold"
                      >
                        Location
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
                    {data?.map((row: TPlan, idx: number) => (
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
                          {row?.title.slice(0, 30)}...
                        </TableCell>
                        <TableCell align="left">
                          {row?.shortDescription?.slice(0, 30)}...
                        </TableCell>
                        <TableCell align="left">
                          {new Date(row.date).toDateString()}
                        </TableCell>
                        <TableCell align="left">{row?.location}</TableCell>
                        <TableCell align="left">
                          {new Date(row?.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="left">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/dashboard/Plans/UpdatePlan/${row._id}`}
                            >
                              <button className=" active:scale-95 text-xl text-white  p-1 bg-orange-500 flex gap-1 items-center rounded-full hover:bg-orange-800">
                                <BiSolidEditAlt />
                              </button>
                            </Link>
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
              onChange={(plan, value) => setCurrentPage(value)}
              color="primary"
            />
          </Stack>
        </div>
      )}
    </div>
  );
};

export default Plans;
