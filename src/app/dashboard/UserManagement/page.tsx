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
import { FaArrowAltCircleDown, FaArrowAltCircleRight } from "react-icons/fa";
import { MdAddBox, MdDelete } from "react-icons/md";
import UpdateUserInfo from "../components/sliders/UpdateUserInfo";
import AddNewUser from "../components/sliders/AddNewUser";

const rows = [
  {
    id: 1,
    name: "Arifur Rahman",
    imageUrl: "/Images/mr-18.jpg",
    email: "info@shouravgroup-bd.com",
    currentRole: "Admin",
    status: "Active",
    CreatedDate: "16 Dec, 2024",
  },
  {
    id: 2,
    name: "Arifur Rahman",
    imageUrl: "/Images/mr-18.jpg",
    email: "info@shouravgroup-bd.com",
    currentRole: "Editor",
    status: "Inactive",
    CreatedDate: "16 Dec, 2024",
  },
];

const UserManagement = () => {
  const [openModalForAdd, setOpenModalForAdd] = useState<boolean>(false);
  const [openModalForUpdate, setOpenModalForUpdate] = useState<boolean>(false);
  return (
    // user
    <div className="bg-white text-black">
      <div className="relative ">
        {/* slider for add info  */}
        <div
          className={`transition-transform duration-500 w-full lg:w-4/5  shadow-lg h-full z-10 overflow-y-auto  fixed ${
            openModalForAdd
              ? "translate-y-0 top-[60px] bg-gray-100"
              : "translate-y-[100%] "
          }  flex justify-center bg-[url(/Images/bg-image-modal.jpg)]   bg-cover bg-center  `}
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
            <AddNewUser />
          </div>
        </div>

        {/* slider for update  info  */}
        <div
          className={`transition-transform duration-500 w-full lg:w-4/5   shadow-lg h-full z-10 overflow-y-auto  fixed ${
            openModalForUpdate
              ? "translate-x-0 top-[60px] bg-gray-100"
              : "translate-x-[100%] "
          } flex justify-center bg-[url(/Images/bg-image-modal-2.jpg)]   bg-cover bg-center  `}
        >
          <div className="mt-8">
            <button
              onClick={() => setOpenModalForUpdate(!openModalForUpdate)}
              className="text-rose-600 px-3 py-1 border border-rose-600 flex flex-row active:scale-95 gap-2 item-center justify-center bg-white absolute left-0 top-0"
            >
              <span className="  text-xl ">
                <FaArrowAltCircleRight />
              </span>{" "}
              <p>Back</p>
            </button>
            <UpdateUserInfo />
          </div>
        </div>
      </div>

      {/* header section  */}
      <div className="my-5  flex  md:flex-row justify-between items-center gap-3 mx-8">
        <h1 className="lg:text-4xl text-xl font-semibold text-orange-500 ">
          Manage User
        </h1>
        <button
          onClick={() => setOpenModalForAdd(!openModalForAdd)}
          className=" active:scale-95 text-xl text-white  p-1 bg-gray-600 hover:bg-slate-800 flex gap-1 items-center pl-3 pr-5"
        >
          <MdAddBox />
          Add New User
        </button>
      </div>

      {/* table section  */}
      <section className="mx-8  ">
        <TableContainer
          component={Paper}
          sx={{ maxWidth: "100%", marginTop: "20px" }}
        >
          <Table
            sx={{ width: "100%", border: "2px solid gray" }}
            aria-label="simple table"
          >
            <TableHead className="bg-blue-200 border-b-2 border-gray-600">
              <TableRow>
                <TableCell align="left" className="text-gray-900 font-semibold">
                  Image
                </TableCell>
                <TableCell align="left" className="text-gray-900 font-semibold">
                  Name
                </TableCell>
                <TableCell align="left" className="text-gray-900 font-semibold">
                  Email
                </TableCell>
                <TableCell align="left" className="text-gray-900 font-semibold">
                  Current Role
                </TableCell>
                <TableCell align="left" className="text-gray-900 font-semibold">
                  Status
                </TableCell>
                <TableCell align="left" className="text-gray-900 font-semibold">
                  Created Date
                </TableCell>
                <TableCell align="left" className="text-gray-900 font-semibold">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Image
                      className="w-[60px] h-[60px]"
                      alt="video"
                      src={row.imageUrl}
                      width={60}
                      height={60}
                    />
                  </TableCell>
                  <TableCell align="left">{row.name}</TableCell>
                  <TableCell align="left">{row.email}</TableCell>
                  <TableCell align="left">{row.currentRole}</TableCell>
                  <TableCell align="left">{row.status}</TableCell>
                  <TableCell align="left">{row.CreatedDate}</TableCell>
                  <TableCell align="left">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setOpenModalForUpdate(!openModalForUpdate)
                        }
                        className=" active:scale-95 text-xl text-white  p-1 bg-orange-500 flex gap-1 items-center rounded-full hover:bg-orange-800"
                      >
                        <BiSolidEditAlt />
                      </button>
                      <button className="bg-rose-600 p-1 text-xl rounded-full text-white active:scale-90 hover:bg-red-800">
                        <MdDelete />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </section>
    </div>
  );
};

export default UserManagement;
