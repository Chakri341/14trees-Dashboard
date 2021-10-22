import { useState, useEffect } from 'react';

import { createStyles, makeStyles } from '@mui/styles';
import { AppBar } from "../../../stories/AppBar/AppBar";
import Backdrop from '@mui/material/Backdrop';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Paper } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Alert from '@mui/material/Alert';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import bg from "../../../assets/bg.png";
import tree from "../../../assets/dark_logo.png";
import { Spinner } from "../../../stories/Spinner/Spinner";

import Axios from "../../../api/local";

import Button from '@mui/material/Button';

const intitialFValues = {
    selectedTreetype: '',
    selectedPlot: '',
    saplingId: '',
    uploaded: false,
    backdropOpen: false
}

export const AddTree = () => {

    const [values, setValues] = useState(intitialFValues);
    const [errors, setErrors] = useState({});
    const [treetype, setTreeType] = useState({});
    const [plots, setPlots] = useState({});
    const classes = UseStyle();

    let [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            // Get Tree types
            let TreeRes = await Axios.get(`/trees/treetypes`);
            if (TreeRes.status === 200) {
                setTreeType(TreeRes.data);
            }

            // Get Plots
            let plotRes = await Axios.get(`/plots`);
            if (plotRes.status === 200) {
                setPlots(plotRes.data);
            }
            setLoading(false);
        })();
    }, []);

    const validate = () => {
        let temp = {};
        temp.treeTypeId = values.selectedTreetype ? "" : "Required Field"
        temp.plotId = values.selectedPlot ? "" : "Required Field"
        temp.saplingId = values.saplingId ? "" : "Required Field"
        setErrors({
            ...temp
        })
        return Object.values(temp).every(x => x === "")
    }

    const handleSaplingIdChange = (e) => {
        validate();
        setValues({
            ...values,
            saplingId: e.target.value
        })
    }

    const handleTreeTypeChange = (value) => {
        setValues({
            ...values,
            selectedTreetype: value
        })
    }

    const handlePlotTypeChange = (value) => {
        setValues({
            ...values,
            selectedPlot: value
        })
    }

    useEffect(() => {
        validate();
    }, [values]);

    const onSubmit = async (e) => {
        if (!validate()) {
            toast.error('Please fill mandatory fields', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else {
            setValues({
                ...values,
                loading: true,
                backdropOpen: true
            })
            const params = JSON.stringify({
                "sapling_id": values.saplingId,
                "tree_id": values.selectedTreetype.tree_id,
                "plot_id": values.selectedPlot.plot_id
            });

            try {
                let res = await Axios.post('/trees/addtree', params, {
                    headers: {
                        'Content-type': 'application/json'
                    },
                })
                if (res.status === 201) {
                    setValues({
                        ...values,
                        loading: false,
                        uploaded: true,
                    })
                    toast.success("Data uploaded successfully!")
                }
            } catch (error) {
                if (error.response.status === 500) {
                    setValues({
                        ...values,
                        loading: false,
                        uploaded: false,
                    })
                    toast.error(error.response.data.error)
                }
            }
        }
    }

    if (loading) {
        return <Spinner />
    } else {
        if (values.uploaded) {
            return (
                <div className={classes.box}>
                    <img alt="bg" src={bg} className={classes.bgimg} />
                    <div className={classes.bg}>
                    <AppBar />
                        <div className={classes.infobox}>
                            <p className={classes.infodesc}>Tree Data Saved</p>
                        </div>
                        <div className={classes.sucessbox}>
                            <Card className={classes.maincard}>
                                <CardContent style={{ 'marginTop': '1%' }}>
                                    <Alert severity="success">
                                        Your data has been uploaded successfuly!
                                    </Alert>
                                    <CardMedia
                                        className={classes.media}
                                        image={tree}
                                        title="tree"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className={classes.box}>
                    <img alt="bg" src={bg} className={classes.bgimg} />
                    <div className={classes.bg}>
                        <AppBar />
                        <div className={classes.inputbox}>
                            <Paper className={classes.paper}>
                                <Backdrop className={classes.backdrop} open={values.backdropOpen}>
                                    <Spinner text={"Sending your data..."} />
                                </Backdrop>
                                <ToastContainer />
                                <h1 className={classes.formheader}>Add Tree</h1>
                                <form className={classes.root} autoComplete='off'>
                                    <Grid container>
                                        <Grid item xs={12} sm={12} md={12}>
                                            <Autocomplete
                                                id="treetype"
                                                options={treetype}
                                                autoHighlight
                                                getOptionLabel={(option) => option.name}
                                                onChange={(event, newValue) => {
                                                    handleTreeTypeChange(newValue);
                                                }}
                                                renderInput={(params) => <TextField {...params} label="Select Tree Type" variant="outlined" />}
                                            />
                                            <Autocomplete
                                                id="plots"
                                                options={plots}
                                                autoHighlight
                                                getOptionLabel={(option) => option.name}
                                                onChange={(event, newValue) => {
                                                    handlePlotTypeChange(newValue);
                                                }}
                                                renderInput={(params) => <TextField {...params} label="Select Plot" variant="outlined" />}
                                            />
                                            <TextField
                                                error={errors.saplingId !== "" ? true : false}
                                                variant='outlined'
                                                label='Sapling ID *'
                                                name='sapling'
                                                value={values.sapling}
                                                helperText="Sapling ID"
                                                onChange={handleSaplingIdChange}
                                            />
                                        </Grid>
                                        {
                                            !values.uimageerror && !values.addimageerror &&
                                            <div className={classes.submitbtn}>
                                                <Button size='large' variant="contained" color='primary' onClick={onSubmit}>Submit</Button>
                                            </div>
                                        }
                                    </Grid>
                                </form>
                            </Paper>
                        </div>
                    </div>
                </div>
            )
        }
    }
}

const UseStyle = makeStyles((theme) =>
    createStyles({
        root: {
            '& .MuiFormControl-root': {
                width: '90%',
                margin: theme.spacing(1),
            },
            [theme.breakpoints.down('md')]: {
                '& .MuiFormControl-root': {
                    width: '93%',
                    margin: '12px',
                },
            }
        },
        box: {
            width: '100%',
            height: '100%',
            position: 'relative',
        },
        bgimg: {
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
        },
        bg: {
            width: '100vw',
            height: '100vh',
            position: 'absolute',
            top: '0',
            bottom: '0',
            left: '0',
            right: '0',
            background: 'linear-gradient(358.58deg, #1F3625 25.04%, rgba(31, 54, 37, 0.636721) 80.2%, rgba(31, 54, 37, 0) 140.95%)',
        },
        maincard: {
            width: "50%",
            marginLeft: "auto",
            marginRight: "auto",
            [theme.breakpoints.down('md')]: {
                width: "90%",
                padding: '0px',
            }
        },
        media: {
            width: '30%',
            height: '330px',
            marginLeft: "auto",
            marginRight: "auto",
            [theme.breakpoints.down('md')]: {
                width: '90%',
            }
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
        formheader: {
            paddingLeft: '1%',
            fontWeight:"500",
            [theme.breakpoints.down('md')]: {
                paddingLeft: "5%",
                paddingTop: '5%',
            }
        },
        inputbox: {
            width: '55vw',
            paddingLeft: '22.5%',
            height: '90vh',
            position: 'relative',
            paddingTop: '10%',
            [theme.breakpoints.down('md')]: {
                width: '90vw',
                paddingLeft: '4vw',
                paddingTop: '15%'
            },
            [theme.breakpoints.down('481')]: {
                paddingTop: '30%'
            }
        },
        paper: {
            margin: theme.spacing(5),
            padding: theme.spacing(3),
            [theme.breakpoints.down('md')]: {
                margin: theme.spacing(0),
                padding: '0px',
            }
        },
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
        },
        submitDiv: {
            display: 'flex',
            // marginLeft:'30px',
            flexDirection: 'row',
            marginTop: '10px',
            marginLeft: '10px',
            [theme.breakpoints.down('md')]: {
                marginLeft: '6%',
                marginBottom: '10px',
            }
        },
        span: {
            flexGrow: "0.89",
        },
        input: {
            display: 'none',
        },
        helper: {
            width: '90%',
            paddingLeft: '1%',
            textAlign: "left",
            [theme.breakpoints.down('md')]: {
                paddingLeft: '5%',
            }
        },
        submitbtn: {
            paddingTop: '20px',
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: '10px',
            display: "block"
        }
    }));