import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import Drawer from '@mui/material/Drawer';
import { createStyles, makeStyles } from '@mui/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useParams } from "react-router";
import { useEffect, useState, useCallback } from "react";

import * as Axios from "../api/local";
import { useRecoilState, useSetRecoilState } from 'recoil';
import { usersData, overallData, pondsImages, navIndex } from '../store/atoms'

import { Profile } from './UserProfile/Profile';
import { Maps } from "./Maps/Maps";
import { Spinner } from "../stories/Spinner/Spinner";
import logo from "../assets/logo_white_small.png"

export const Dashboard = () => {

    const { saplingId } = useParams();
    // const greaterThan375 = useMediaQuery("(min-width:375px)");
    const classes = useStyles();

    const setUserinfo = useSetRecoilState(usersData);
    const setOverallInfo = useSetRecoilState(overallData);
    const setPondsImages = useSetRecoilState(pondsImages);
    const [index, setIndex] = useRecoilState(navIndex);

    const [loading, setLoading] = useState(true);


    const onClickNav = (value) => {
        setIndex(value);
    }

    const fetchData = useCallback(async () => {

        const response = await Axios.default.get(`/profile?id=${saplingId}`);
        if (response.status === 200) {
            setUserinfo(response.data);
        } else if (response.status === 204) {
            setLoading(false);
            setUserinfo(response.data);
        }

        const overallResponse = await Axios.default.get(`/analytics/totaltrees`);
        if (overallResponse.status === 200) {
            setOverallInfo(overallResponse.data);
        }

        const pondImagesRes = await Axios.default.get(`/analytics/totalponds`);
        if (pondImagesRes.status === 200) {
            setPondsImages(pondImagesRes.data);
        }

        // const totEmpRes = await Axios.default.get(`/analytics/totalemployees`);
        // if (totEmpRes.status === 200) {
        //     setTotEmp(totEmpRes.data);
        // }

        setLoading(false);
    }, [saplingId]);

    useEffect(() => {
        fetchData()
    }, [fetchData]);

    const pages = [
        {
            page: Profile,
            displayName: 'Profile',
            logo: logo
        },
        {
            page: Maps,
            displayName: 'Site Map',
            logo: logo
        },
        {
            page: Maps,
            displayName: 'Trees',
            logo: logo
        },
    ]
    const mainBox = () => {
        console.log(index)
        const Page = pages[index].page
        return (
            <Page />
        )
    }

    if (loading) {
        return <Spinner />
    } else {
        return (
            <Box sx={{ display: 'flex' }}>
                <Drawer
                    className={classes.drawer}
                    variant="permanent"
                    anchor="left"
                >
                    <Divider />
                    <img className={classes.logo} alt={'logo'} src={logo} />
                    <div className={classes.itemlist}>
                        {
                            pages.map((item, i) => {
                                return (
                                    <div className={classes.item} onClick={() => onClickNav(i)} key={i}>
                                        <div className={index === i ? classes.selected : classes.itembtn}>
                                            <img className={classes.itemlogo} alt={"items"} src={item.logo} />
                                            <div className={classes.itemtext}>{item.displayName}</div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </Drawer>
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    {
                        mainBox()
                    }
                </Box>
            </Box >
        );
    }
}

const useStyles = makeStyles(() =>
    createStyles({
        drawer: {
            width: '17%',
            '& .MuiPaper-root': {
                width: '17%',
                backgroundColor: '#3F5344',
                borderTopRightRadius: '10px'
            }
        },
        itemlist: {
            width: '100%',
            color: '#ffffff',
        },
        item: {
            cursor: 'pointer',
            color: '#ffffff',
            width: '160px',
            margin: '0 auto 20px auto',
        },
        itembtn: {
            borderRadius: '20px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#3F5344',
            '&:hover': {
                backgroundColor: '#9BC53D',
            },
        },
        selected: {
            borderRadius: '20px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#9BC53D',
        },
        logo: {
            width: '80px',
            height: '100px',
            margin: '25px auto 30px auto',
            paddingTop: '25px'
        },
        itemlogo: {
            width: '18px',
            height: '20px',
        },
        itemtext: {
            margin: '5px',
            fontWeight: 450,
            fontSize: 16,
        }
    }),
);