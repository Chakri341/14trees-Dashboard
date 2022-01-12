import { Button, Box, Grid, Typography } from "@mui/material"
import { createStyles, makeStyles } from "@mui/styles";
import { useRecoilValue, useSetRecoilState } from "recoil";
import 'react-toastify/dist/ReactToastify.css';

import { albums, wwSelectedAlbumImage } from "../../store/adminAtoms";
import { useState } from "react";
import { CreateAlbumDialog } from "./CreateAlbumDialog";
import { ShowImagesDlg } from "./ShowImagesDlg";

export const Albums = ({handleCreateAlbum}) => {
    const albumsData = useRecoilValue(albums);
    const setImages = useSetRecoilState(wwSelectedAlbumImage);
    const [createAlbmDlgOpen, setAlbnDlgOpen] = useState(false);
    const [showAlbmDlgOpen, setShowAlbmDlgOpen] = useState(false);
    const classes = useStyles();
    console.log(albumsData);

    const handleClickDlgOpen = () => {
        setAlbnDlgOpen(true)
    }

    const handleDlgClose = () => {
        setAlbnDlgOpen(false)
    }

    const handleAlbumClick = (images) => {
        setImages(images);
        setShowAlbmDlgOpen(true);
    }

    const handleSubmit = (name, files) => {
        handleCreateAlbum(name, files)
    }
    return (
        <>
            <div style={{display:'flex', justifyContent:'space-between'}}>
                <Typography variant="h4" align="left" sx={{pl:1,fontWeight: '600', color: '#1f3625'}}>
                    Albums ({albumsData.length})
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleClickDlgOpen()}
                >
                    Create Album
                </Button>
            </div>
            <Typography variant='subtitle1' align="left" sx={{pl:1}}>
                These albums can be used to add memory images while gifting.
            </Typography>
            <ShowImagesDlg open={showAlbmDlgOpen} onClose={() => setShowAlbmDlgOpen(false)}/>
            <CreateAlbumDialog open={createAlbmDlgOpen} onClose={handleDlgClose} formData={handleSubmit}/>
            {
                albumsData.length > 0 && (
                    <div className={classes.albumbox}>
                        <Grid container spacing={5}>
                            {
                                albumsData.map((albumData) => {
                                    return (
                                        <Grid item xs={12} md={6} lg={4}>
                                            <Box sx={{
                                                minWidth: '100%',
                                                maxWidth: '320px',
                                                minHeight: '320px',
                                                borderRadius: '15px',
                                                boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.15)',
                                                position: 'relative',
                                                cursor: 'pointer',
                                            }}
                                            >
                                                <div style={{
                                                    backgroundImage: `url(${albumData.images[0]})`,
                                                    width:'100%',
                                                    height: '320px',
                                                    borderRadius: '15px',
                                                }}
                                                onClick={() => handleAlbumClick(albumData.images)}
                                                >
                                                    <div style={{
                                                        width: '100%',
                                                        height: '60px',
                                                        backgroundColor:'rgb(0, 0, 0)',
                                                        background: 'rgba(0, 0, 0, 0.5)',
                                                        color: '#ffffff',
                                                        fontSize: '32px',
                                                        textAlign: 'center',
                                                        borderBottomLeftRadius: '15px',
                                                        borderBottomRightRadius: '15px',
                                                        position:'absolute',
                                                        bottom: 0}}>
                                                        {albumData.album_name}
                                                    </div>
                                                </div>
                                            </Box>
                                        </Grid>
                                    )
                                })
                            }
                        </Grid>
                    </div>
                )
            }
        </>
    )
}

const useStyles = makeStyles((theme) =>
    createStyles({
        images:{
            marginTop: '40px', height: '50vh', width: '80%',marginRight:'auto',
            [theme.breakpoints.down('480')]: {
                width: '100%',
                height: '45vh',
            },
        },
        checkbox:{
            marginTop: '60px', height: 'auto', width: '20%',marginLeft: 'auto',marginRight:'auto',textAlign:'center',
            [theme.breakpoints.down('480')]: {
                width: '100%',
            },
        },
        albumbox:{
            margin: '32px',
            padding: theme.spacing(5),
            borderRadius: '15px',
            backgroundColor: '#ffffff'
        },
    })
)