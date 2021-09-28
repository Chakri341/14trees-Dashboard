import { createStyles, makeStyles } from '@mui/styles';
import Divider from '@mui/material/Divider';

import { useState } from "react";
import { UserInfo } from "./UserInfo/UserInfo";
import { Trees } from "./Trees/Trees";
import { Map } from "./Map/Map";

import { useRecoilValue } from 'recoil';
import { usersData } from '../../store/atoms';

import logo from "../../assets/icon_round.png"

export const Profile = () => {
    const classes = useStyles();

    const userinfo = useRecoilValue(usersData);
    const [activeStep, setActiveStep] = useState(0);

    const handleInfoChange = (i) => {
        setActiveStep(i)
    }

    console.log(userinfo)

    const username = userinfo.user.user.name.split(" ")[0]

    return (
        <div className={classes.main}>
            <div style={{ display: 'flex', marginBottom: '20px' }}>
                <img src={logo} alt={logo} style={{ width: '50px', height: '50px', marginTop: '20px' }} />
                <div className={classes.username}>
                    {username}'s Dashboard
                </div>
            </div>
            <Divider />
            <div className={classes.user}>
                <UserInfo />
            </div>
            <div style={{ fontSize: '30px', marginTop: '5vh', height: '55vh' }}>
                <div style={{ display: 'flex' }}>
                    <div style={{ width: '40%', height: '45vh', margin: '20px', marginRight: '-20px', zIndex: '1' }}><Trees /></div>
                    <div style={{ width: '60%', height: '45vh', margin: '20px', marginLeft: '-10px' }}><Map /></div>
                </div>
            </div>
            {/* <div className="p-grid" style={{ "marginTop": "15px" }}>
                <div className="p-col-12 p-md-6 p-sm-12">

                </div>
                <div className="p-col-12 p-md-6 p-sm-12">
                    <div style={{ height: '54vh' }}>
                        <h2 style={{ marginTop: '18px' }}>Site Map</h2>
                        <Trees />
                        <Map
                            trees={userinfo.trees}
                            currentInfo={activeStep}
                            handleInfoChange={handleInfoChange}
                        />
                    </div>
                </div>
            </div> */}
        </div>
    )
}

const useStyles = makeStyles((theme) =>
    createStyles({
        main: {
            marginTop: '1%',
            marginLeft: '20px',
        },
        username: {
            lineHeight: '50px',
            fontSize: '28px',
            color: '#1F3625',
            paddingLeft: '20px',
            fontWeight: '500',
            marginTop: '20px'
        },
        user: {
            display: 'flex',
            maxHeight: '35vh',
        }
    })
);