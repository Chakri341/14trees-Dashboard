/* eslint-disable array-callback-return */
import { useEffect, useState, useCallback } from 'react';
import { createStyles, makeStyles } from '@mui/styles';
import {
    Typography,
    Button,
    Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow,
    TablePagination,
    FormControl, RadioGroup, Radio, FormControlLabel,
    Box, Checkbox
} from "@mui/material";
import { useRecoilState } from 'recoil';
import { ToastContainer, toast } from 'react-toastify';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import imageCompression from 'browser-image-compression';

import { Spinner } from '../../components/Spinner';
import { GiftDialog } from './GiftDialog';
import { PwdDialog } from './PwdDialog';
import { ShareDialog } from './ShareDialog';
import Axios from "../../api/local";
import logo from '../../assets/gift/logogift.png';
import tree from "../../assets/dark_logo.png";
import bg from "../../assets/gift/bg.png";
import bgfooter from "../../assets/gift/bgfooter.png";
import footer from "../../assets/gift/footer.png";
import { albums } from '../../store/adminAtoms';
import { Albums } from './Albums';

const intitialFValues = {
    name: '',
    email: '',
    contact: '',
    saplingid: '',
    uploaded: false,
    loading: true,
    backdropOpen: false,
    dlgOpen: false,
    selectedSaplingId: 0,
    selectedPlotId: '',
    user: {},
    trees: [],
    filteredTrees: [],
    selectedTreeSum: 0,
    pwdDlgOpen: true,
    shareDlgOpen: false,
    shareName: '',
    shareTree: '',
    shareTreeId: '',
}

export const GiftTrees = () => {
    let { email } = useParams();

    const classes = useStyles();
    const [page, setPage] = useState(0);
    const [values, setValues] = useState(intitialFValues);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState('all');
    const [al, setAlbums] = useRecoilState(albums);

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
        if (event.target.value === 'all') {
            setValues({
                ...values,
                filteredTrees: values.trees
            })
        } else if (event.target.value === 'assigned') {
            let temp = values.trees.filter((item) => {
                return item.assigned
            })
            setValues({
                ...values,
                filteredTrees: temp
            })
        } else if (event.target.value === 'unassigned') {
            let temp = values.trees.filter((item) => {
                return !item.assigned
            })
            setValues({
                ...values,
                filteredTrees: temp
            })
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const compressImageList = async (file) => {

        const options = {
            maxSizeMB: 2.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        }

        let compressedFile;

        try {
            compressedFile = await imageCompression(file, options);
        } catch (error) {
            console.log(error);
        }

        return new File([compressedFile], file.name);
    }
    const handleClickOpen = () => {
        setValues({
            ...values,
            dlgOpen: true,
        })
    };

    const handlePwdDlgClose = () => {
        setValues({
            ...values,
            pwdDlgOpen: false
        })
    }

    const handleShareDlgClose = () => {
        setValues({
            ...values,
            shareDlgOpen: false
        })
    }

    const handleClose = () => {
        setValues({
            ...values,
            dlgOpen: false
        })
    };

    const handleFormData = async (formData, img, albumName) => {
        let images = [];
        if (albumName !== "none") {
            images = al.filter(album => { return album.album_name === albumName })[0].images
        }
        await assignTree(formData, img, images);
    }

    const handleShare = (sapling_id, tree_name, name) => {
        setValues({
            ...values,
            shareName: name,
            shareTree: tree_name,
            shareTreeId: sapling_id,
            shareDlgOpen: true
        })
    }

    const handleTemplateShare = (type, link) => {
        if (type === "1") {
            window.open(`http://dashboard.14trees.org/events/birthday/${link}`, '_blank')
        }
    }
    const fetchTrees = useCallback(async () => {
        try {
            let profileTrees = await Axios.get(`/mytrees/${email}`);
            if (profileTrees.status === 200) {
                let data = profileTrees.data.trees
                data = data.map(tree => ({ ...tree, selected: false }))
                setValues((values) => {
                    return {
                        ...values,
                        user: profileTrees.data.user[0],
                        trees: data,
                        filteredTrees: data,
                    }
                })
            }

            let albums = await Axios.get(`/mytrees/albums/${email}`);
            if (albums.status === 200) {
                setAlbums(albums.data.albums)
            }

            setValues((values) => {
                return {
                    ...values,
                    loading: false
                }
            })

        } catch (error) {
            if (error.response.status === 404) {
                setValues((values) => {
                    return {
                        ...values,
                        loading: false,
                        backdropOpen: false
                    }
                })
                toast.error(error.response.data.error)
            }
        }
    }, [email, setAlbums])

    useEffect(() => {
        (async () => {
            await fetchTrees();
        })();
    }, [fetchTrees]);

    const handleSaplingClick = () => {
        window.open("http://dashboard.14trees.org/profile/" + values.shareTreeId);
    }

    const download = (type) => {
        setValues({
            ...values,
            loading: true
        })
        const params = JSON.stringify({
            "sapling_id": values.shareTreeId,
            "tree_name": values.shareTree,
            "name": values.shareName,
            "type": type === '1' ? 'bd' : 'hny'
        });
        try {
            Axios.post('/templates/', params, {
                responseType: 'arraybuffer',
                headers: {
                    'Content-type': 'application/json'
                },
            })
                .then((img) => {
                    const file = new Blob([img.data], { type: 'image/png' })
                    return file
                })
                .then((blob) => {
                    let url = window.URL.createObjectURL(blob);
                    let link = document.createElement('a');
                    link.href = url;
                    link.download = values.shareName;
                    link.click();
                })
            setValues({
                ...values,
                loading: false
            })
            toast.success("Image downloded successfully!")
        } catch (error) {
            setValues({
                ...values,
                loading: false
            })
            if (error.response.status === 500) {
                toast.error(error.response.data.error)
            } else if (error.response.status === 409) {
                toast.error(error.response.data.error)
            }
        }
    }

    const assignTree = async (formValues, img, images) => {
        setValues({
            ...values,
            loading: true,
            backdropOpen: true
        })
        const formData = new FormData()
        let sapling_ids = values.filteredTrees.filter(t => t.selected === true).map(a => a.tree_id.sapling_id);
        const date = moment(formValues.dob).format('YYYY-MM-DD')
        formData.append('name', formValues.name)
        formData.append('email', formValues.email);
        formData.append('dob', date);
        formData.append('contact', formValues.contact);
        formData.append('sapling_id', sapling_ids);
        formData.append('donor', values.user._id);

        if (img !== null) {
            let userImages = [];
            let image = await compressImageList(img);
            formData.append('files', image)
            userImages.push(img.name)
            formData.append('userimages', userImages);
        }

        if (formValues.type !== "") {
            formData.append('type', formValues.type)
        }

        if (images.length > 0) {
            formData.append('albumimages', images);
        }

        let res;
        if (formValues.type === "1") {
            try {
                res = await Axios.post('/events/addevents/', formData, {
                    headers: {
                        'Content-type': 'multipart/form-data'
                    },
                })

                if (res.status === 201) {
                    const params = JSON.stringify({
                        "sapling_ids": sapling_ids,
                        "user_id": res.data.result.assigned_to[0],
                        "link": res.data.result.link,
                        "type": res.data.result.type,
                    })
                    await Axios.post('/mytrees/update', params, {
                        headers: {
                            'Content-type': 'application/json'
                        },
                    })

                    let profileTrees = await Axios.get(`/mytrees/${email}`);
                    if (profileTrees.status === 200) {
                        setValues({
                            ...values,
                            loading: false,
                            user: profileTrees.data.user[0],
                            trees: profileTrees.data.trees,
                            dlgOpen: false,
                            uploaded: true,
                        })
                    }
                    toast.success("Data uploaded successfully!")
                } else if (res.status === 204 || res.status === 400 || res.status === 409 || res.status === 404) {
                    setValues({
                        ...values,
                        loading: false,
                        dlgOpen: false,
                        backdropOpen: false
                    })
                    toast.error(res.status.error)
                }
            } catch (error) {
                setValues({
                    ...values,
                    loading: false,
                    dlgOpen: false,
                    backdropOpen: false
                })
                if (error.response.status === 409 || error.response.status === 404) {
                    toast.error(error.response.data.error)
                }
            }
        } else {
            try {
                res = await Axios.post('/profile/usertreereg/multi', formData, {
                    headers: {
                        'Content-type': 'multipart/form-data'
                    },
                })

                if (res.status === 201) {
                    const params = JSON.stringify({
                        "sapling_ids": sapling_ids,
                        "user_id": res.data.usertreereg.user
                    })
                    await Axios.post('/mytrees/update', params, {
                        headers: {
                            'Content-type': 'application/json'
                        },
                    })

                    let profileTrees = await Axios.get(`/mytrees/${email}`);
                    if (profileTrees.status === 200) {
                        setValues({
                            ...values,
                            loading: false,
                            user: profileTrees.data.user[0],
                            trees: profileTrees.data.trees,
                            dlgOpen: false,
                            uploaded: true,
                        })
                    }
                    toast.success("Data uploaded successfully!")
                } else if (res.status === 204 || res.status === 400 || res.status === 409 || res.status === 404) {
                    setValues({
                        ...values,
                        loading: false,
                        dlgOpen: false,
                        backdropOpen: false
                    })
                    toast.error(res.status.error)
                }
            } catch (error) {
                setValues({
                    ...values,
                    loading: false,
                    dlgOpen: false,
                    backdropOpen: false
                })
                if (error.response.status === 409 || error.response.status === 404) {
                    toast.error(error.response.data.error)
                }
            }
        }
    }

    const handleCreateAlbum = async (album_name, files) => {
        setValues({
            ...values,
            loading: true,
            backdropOpen: true
        })
        const formData = new FormData()
        formData.append('album_name', album_name)
        formData.append('name', values.user.name);
        const albumimages = [];
        if (files) {
            for (const key of Object.keys(files)) {
                let image = await compressImageList(files[key]);
                formData.append('images', image)
                albumimages.push(files[key].name)
            }
        }
        formData.append('files', albumimages);
        try {
            let res = await Axios.post(`/mytrees/albums/${email}`, formData, {
                headers: {
                    'Content-type': 'multipart/form-data'
                },
            })

            if (res.status === 201) {
                let albums = await Axios.get(`/mytrees/albums/${email}`);
                if (albums.status === 200) {
                    setAlbums(albums.data.albums)
                }
                setValues({
                    ...values,
                    loading: false,
                    uploaded: true,
                })
                toast.success("Data uploaded successfully!")
            } else if (res.status === 204 || res.status === 400 || res.status === 409 || res.status === 404) {
                setValues({
                    ...values,
                    loading: false,
                    backdropOpen: false
                })
                toast.error(res.status.error)
            }
        } catch (error) {
            setValues({
                ...values,
                loading: false,
                backdropOpen: false
            })
            if (error.response.status === 409 || error.response.status === 404) {
                toast.error(error.response.data.error)
            }
        }
    }

    const handleSelectTrees = (event, value) => {

        values.filteredTrees.forEach((item, index) => {
            if (item.tree_id.sapling_id === value.tree_id.sapling_id && !item.assigned) {
                item.selected = !value.selected;
            }
        });
        const sum = values.filteredTrees
            .map(item => item.selected)
            .reduce((prev, curr) => prev + curr, 0);

        setValues({
            ...values,
            selectedTreeSum: sum,
        })
    };

    // const handleSelectAlltree = (event) => {
    //     let selTrees = values.filteredTrees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    //     if (event.target.checked) {
    //         // selTrees = selTrees.filter(tree => { return tree.assigned === false })
    //         values.filteredTrees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(tree => (tree.assigned === false ? { ...tree, selected: true } : { ...tree }));
    //     } else {
    //         values.filteredTrees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(tree => ({ ...tree, selected: false }))
    //     }
    //     const sum = selTrees
    //         .map(item => item.selected)
    //         .reduce((prev, curr) => prev + curr, 0);

    //     setValues({
    //         ...values,
    //         selectedTreeSum: sum,
    //         // filteredTrees: selTrees
    //     })
    // }
    // console.log(selectedTrees);

    if (values.loading) {
        return <Spinner />
    } else {
        if (Object.keys(values.user).length === 0 && !values.loading) {
            return (
                <Typography variant='h2' align='center' sx={{ p: 8, fontWeight: 'bold' }}>
                    User ID not found!
                </Typography>
            )
        } else {
            return (
                <>
                    <PwdDialog
                        open={values.pwdDlgOpen}
                        onClose={handlePwdDlgClose} />
                    <div className={classes.bg}>
                        <Box sx={{
                            textAlign: 'center', p: 6,
                            '@media screen and (max-width: 640px)': {
                                p: 2,
                            },
                        }}>
                            <img src={logo} className={classes.logo} alt="logoo" />
                            <div className={classes.headerbox}>
                                <Typography variant='h5' align='center' sx={{ color: '#1f3625', fontWeight: '550' }}>
                                    <span>Thank You {values.user.name} for your generous donation to the 14 Trees Foundation and for supporting the efforts in building sustainable, carbon-footprint-neutral eco-systems through re-forestation.</span>
                                </Typography>
                                <Typography variant='subtitle1' align='left' sx={{ lineHeight: '25px', fontSize: '20px', color: '#1f3625', pt: 6, pb: 3 }}>
                                    Your generous support is helping us will plant more trees to combat the effects of environmental degradation and climate change as well as support projects on habitat restoration, groundwater recharging, biodiversity experiments, and also provide a livelihood for local tribal villagers.
                                </Typography>
                                <Typography align='left' sx={{ lineHeight: '25px', fontSize: '20px', color: '#1f3625', pb: 3 }}>
                                    The following trees have been planted as a result of your support which you can assign to your family members, friends, and loved ones by following the steps mentioned here.
                                </Typography>
                                <Typography align='left' sx={{ lineHeight: '25px', fontSize: '20px', color: '#1f3625', pb: 3 }}>
                                    Once again, thank you for your support.
                                </Typography>
                                <Typography align='left' sx={{ lineHeight: '25px', fontSize: '20px', fontWeight: '500', color: '#1f3625', pb: 3 }}>
                                    Thank You,
                                    <p style={{ margin: '0px', fontWeight: 'bold' }}>Team, 14Trees Foundation</p>
                                </Typography>
                            </div>
                        </Box>
                        <div style={{ position: 'relative' }}>
                            <img src={bg} className={classes.landingimg} alt="bg" />
                            <div style={{ background: 'linear-gradient(360deg, #3F5344 17.02%, rgba(63, 83, 68, 0) 100%)', height: '230px', position: 'relative', zIndex: '999', marginTop: '-200px' }}></div>
                            <img src={bgfooter} className={classes.bgfooter} alt="bgfooter" />
                        </div>
                        <GiftDialog
                            open={values.dlgOpen}
                            onClose={handleClose}
                            formData={handleFormData} />
                        <div className={classes.itembox}>
                            <Albums
                                handleCreateAlbum={handleCreateAlbum} />
                        </div>
                        <div className={classes.itembox} style={{ paddingTop: '32px' }}>
                            <Box>
                                <Typography variant="h4" align="left" sx={{ pl: 1, pt: 4, pb: 4, fontWeight: '600', color: '#1f3625' }}>
                                    Tree Holdings ( {values.trees.length} )
                                </Typography>
                                <FormControl component="fieldset" sx={{ alignSelf: 'center', pl: 2 }}>
                                    <RadioGroup row aria-label="assigned" onChange={handleFilterChange} value={filter}>
                                        <FormControlLabel value="all" control={<Radio />} label="All" />
                                        <FormControlLabel value="assigned" control={<Radio />} label="Assigned" />
                                        <FormControlLabel value="unassigned" control={<Radio />} label="Un-Assigned" />
                                    </RadioGroup>
                                </FormControl>
                            </Box>
                            <ToastContainer />
                            {
                                tree.length === 0 && (
                                    <Typography variant="h5" align="left" sx={{ pl: 4, pt: 2, pb: 2 }}>
                                        No Trees in your account
                                    </Typography>
                                )
                            }
                            <TableContainer>
                                <Table sx={{ minWidth: 360 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow sx={{ fontSize: '16px' }}>
                                            <TableCell align="right"></TableCell>
                                            {/* <TableCell align="left"><Checkbox onClick={(e) => handleSelectAlltree(e)} /></TableCell> */}
                                            <TableCell>Tree Name</TableCell>
                                            <TableCell align="center">Sapling ID</TableCell>
                                            <TableCell align="center">Plot</TableCell>
                                            <TableCell align="right"></TableCell>
                                            <TableCell align="right"></TableCell>
                                            <TableCell>
                                                <Button
                                                    sx={{ ml: 'auto', mr: 'auto' }}
                                                    variant="contained"
                                                    color='primary'
                                                    disabled={values.selectedTreeSum <= 0}
                                                    onClick={handleClickOpen}
                                                >
                                                    Assign
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody className={classes.tblrow}>
                                        {
                                            values.filteredTrees
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .map((row) => (
                                                    <TableRow
                                                        key={row._id}
                                                        sx={{
                                                            m: 2
                                                        }}
                                                    >
                                                        <TableCell onClick={(event) => handleSelectTrees(event, row)} align="center">
                                                            <Checkbox
                                                                disabled={row.assigned && row.type !== null}
                                                                checked={row.selected}
                                                            />
                                                        </TableCell>
                                                        <TableCell component="th" scope="row">
                                                            {row.tree_id.tree_id.name}
                                                        </TableCell>
                                                        <TableCell align="center" style={{ cursor: 'pointer' }}>{row.tree_id.sapling_id}</TableCell>
                                                        <TableCell align="center">{row.tree_id.plot_id.name}</TableCell>
                                                        <TableCell align="center">
                                                            {
                                                                row.assigned ?
                                                                    (
                                                                        <>
                                                                            <Typography variant='subtitle2' align='center' sx={{ p: 1, pb: 0, fontSize: '12px' }}>
                                                                                Assigned To
                                                                            </Typography>
                                                                            <Typography variant='subtitle1' align='center' sx={{ fontWeight: 'bold', color: '#1F3625' }}>
                                                                                {row.assigned_to.name}
                                                                            </Typography>
                                                                        </>
                                                                    ) :
                                                                    <></>
                                                            }
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Button
                                                                sx={{ ml: 'auto', mr: 'auto' }}
                                                                variant="contained"
                                                                color='primary'
                                                                disabled={!row.assigned}
                                                                onClick={() =>
                                                                    handleShare(row.tree_id.sapling_id, row.tree_id.tree_id.name, row.assigned_to.name)}
                                                            >
                                                                Card
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {
                                                                (row.type !== undefined && row.type !== "") && (
                                                                    <Button
                                                                        sx={{ ml: 'auto', mr: 'auto' }}
                                                                        variant="contained"
                                                                        color='primary'
                                                                        disabled={!row.assigned && row.type !== null}
                                                                        onClick={() => handleTemplateShare(row.type, row.link)}
                                                                    >
                                                                        Share
                                                                    </Button>
                                                                )
                                                            }
                                                        </TableCell>
                                                        <ShareDialog
                                                            open={values.shareDlgOpen}
                                                            onClose={handleShareDlgClose}
                                                            submit={download}
                                                            handleClick={() => handleSaplingClick(row)}
                                                        />
                                                    </TableRow>
                                                ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 100]}
                                component="div"
                                count={values.filteredTrees.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </div>
                        <div className={classes.footer}>
                        </div>
                    </div>
                </>
            )
        }
    }
}

const useStyles = makeStyles((theme) =>
    createStyles({
        bg: {
            backgroundColor: '#E9EAE7',
            width: '100%',
        },
        logo: {
            width: '90px',
            height: '110px',
            padding: theme.spacing(2)
        },
        headerbox: {
            width: '80%', maxWidth: '920px', marginLeft: 'auto', marginRight: 'auto',
            [theme.breakpoints.down('md')]: {
                width: '100%'
            }
        },
        landingimg: {
            width: '100%', height: 'auto', marginTop: '-250px',
            [theme.breakpoints.down('1200')]: {
                marginTop: '-80px',
                minHeight: '350px',
            }
        },
        bgfooter: {
            width: '100%',
            height: '90px',
            marginTop: '-5px',
            [theme.breakpoints.down('1200')]: {
                height: '50px'
            }
        },
        itembox: {
            maxWidth: '1080px',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingBottom: theme.spacing(10),
            paddingTop: theme.spacing(12),
            [theme.breakpoints.down('1200')]: {
                padding: '32px 8px 48px 8px'
            }
        },
        left: {
            width: '100%',
            marginRight: '10px',
        },
        center: {
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
        },
        right: {
            width: '100%',
            marginLeft: '10px'
        },
        infobox: {
            marginTop: '5%',
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            [theme.breakpoints.down('md')]: {
                flexWrap: 'wrap',
            }
        },
        infodesc: {
            fontSize: '30px',
            paddingLeft: '1%',
            fontWeight: '500',
            color: '#ffffff',
            alignItems: 'center',
            textAlign: 'center',
            [theme.breakpoints.down('md')]: {
                fontSize: '20px',
            }
        },
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
        },
        tblrow: {
            '& .MuiTableCell-root': {
                padding: '16px',
            },
            '& .MuiTableRow-root': {
                fontSize: '20px',
                backgroundColor: '#ffffff',
                borderRadius: '10px'
            }
        },
        footer: {
            marginTop: '48px',
            backgroundImage: `url(${footer})`,
            height: '245px',
            width: 'auto',
        }
    }))