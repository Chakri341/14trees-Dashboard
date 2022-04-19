import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { createStyles, makeStyles } from "@mui/styles";
import "react-toastify/dist/ReactToastify.css";

import asset1 from "../../assets/events/birthday_1.png";
import asset2 from "../../assets/events/birthday_2.png";
import logo from "../../assets/events/logo.svg";
import * as Axios from "../../api/local";
import { Spinner } from "../../components/Spinner";
import {
  Box,
  Card,
  Theme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { ImageViewer } from "../../components/ImageViewer";
import { NotFound } from "../notfound/NotFound";

type obj = {
  profile_image: [string];
  sapling_id: string;
  name: string;
  tree_image: [string];
};

type IEvents = {
  loading: boolean;
  org?: string;
  data?: [obj];
};

export const OrgEvent = () => {
  const [values, setValues] = useState<IEvents>({ loading: true });

  const [searchParams] = useSearchParams();
  const fromdate = searchParams.get("fromdate");
  const todate = searchParams.get("todate");
  const org = searchParams.get("org");
  const classes = useStyles();

  const fetchData = useCallback(async () => {
    try {
      const response = await Axios.default.get(
        `/events?fromdate=${fromdate}&todate=${todate}&org=${org}`
      );
      console.log(response.data);
      setValues({
        ...values,
        loading: false,
        org: response.data.org,
        data: response.data.result,
      });
      toast.success("Data Fetched!");
    } catch (error) {
      setValues({
        ...values,
        loading: false,
      });
      toast.error("Error occured while fetching data!");
    }
  }, [setValues, fromdate, todate, org, values]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (values?.loading) {
    return <Spinner text={"Fetching event data!"} />;
  } else {
    return (
      <>
        <ToastContainer />
        {values?.data?.length === undefined ? (
          <NotFound />
        ) : (
          <>
            <div style={{ minHeight: "100vh", zIndex: "-10" }}>
              <div
                style={{
                  backgroundColor: "#664E2D",
                  height: "100vh",
                  zIndex: "-100",
                  position: "relative",
                }}
              >
                <img src={logo} alt="logo" className={classes.imgLogo} />
                <img src={asset1} alt="asset1" className={classes.asset1} />
                <img src={asset2} alt="asset2" className={classes.asset2} />
                <div className={classes.hdrTxt}>
                  {values?.org} visit to 14trees
                </div>
                <div className={classes.imgBox}>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      maxWidth: "1400px",
                      ml: {
                        xs: "10%",
                        md: "auto",
                      },
                      mr: {
                        md: "auto",
                      },
                      mt: {
                        xs: "5%",
                        md: "10px",
                      },
                    }}
                  >
                    {values.data.map((item) => {
                      return (
                        <Card
                          sx={{
                            width: {
                              xs: "180px",
                              md: "270px",
                            },
                            height: {
                              xs: "240px",
                              md: "350px",
                            },
                          }}
                          key={item.name}
                        >
                          <ImageViewer
                            image={
                              item.profile_image[0] !== ""
                                ? item.profile_image[0]
                                : item.tree_image[0]
                            }
                            handleClick={function (): {} {
                              throw new Error("Function not implemented.");
                            }}
                          />
                        </Card>
                      );
                    })}
                  </Box>
                  <TableContainer>
                    <Table
                      sx={{
                        minWidth: 360,
                        maxWidth: 1080,
                        ml: "auto",
                        mr: "auto",
                        mt: "40px",
                        mb: "48px",
                      }}
                      aria-label="simple table"
                    >
                      <TableHead>
                        <TableRow sx={{ fontSize: "16px" }}>
                          <TableCell>Name</TableCell>
                          <TableCell align="center">Sapling ID</TableCell>
                          <TableCell align="center">Dashboard</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody className={classes.tblrow}>
                        {values.data.map((row) => (
                          <TableRow
                            key={row.sapling_id}
                            sx={{
                              m: 2,
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {row.name}
                            </TableCell>
                            <TableCell align="center">
                              {row.sapling_id}
                            </TableCell>
                            <TableCell
                              sx={{ cursor: "pointer" }}
                              align="center"
                              onClick={() => {
                                window.open(
                                  `https://dashboard.14trees.org/profile/${row.sapling_id}`
                                );
                              }}
                            >
                              https://dashboard.14trees.org/profile/
                              {row.sapling_id}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  }
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    imgLogo: {
      position: "absolute",
      top: "10%",
      left: "7%",
      width: "80px",
      height: "110px",
    },
    asset1: {
      top: 0,
      right: 0,
      position: "absolute",
      height: "auto",
      width: "60vw",
      [theme.breakpoints.down(1200)]: {
        width: "80vw",
      },
    },
    asset2: {
      top: "49vh",
      right: 0,
      position: "absolute",
      height: "auto",
      width: "45vw",
      zIndex: "1",
      [theme.breakpoints.down(1200)]: {
        width: "60vw",
      },
      [theme.breakpoints.down(900)]: {
        width: "80vw",
        top: "80vh",
      },
    },
    hdrTxt: {
      position: "absolute",
      left: "7%",
      top: "35%",
      color: "#ffffff",
      fontSize: "47px",
      lineHeight: "66px",
      maxWidth: "50%",
      fontFamily: "Noto Serif JP",
      fontWeight: "500",
      zIndex: "20",
      [theme.breakpoints.down(1200)]: {
        maxWidth: "70%",
      },
      [theme.breakpoints.down(720)]: {
        maxWidth: "100%",
        fontSize: "32px",
        lineHeight: "45px",
      },
    },
    imgBox: {
      position: "absolute",
      top: "50%",
      zIndex: "999",
      width: "100%",
    },
    tblrow: {
      "& .MuiTableCell-root": {
        padding: "16px",
      },
      "& .MuiTableRow-root": {
        fontSize: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "10px",
      },
    },
  })
);
