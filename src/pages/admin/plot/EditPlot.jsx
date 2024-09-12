import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import TagSelector from "../../../components/TagSelector";
import * as siteActionCreators from "../../../redux/actions/siteActions";
import { useAppSelector, useAppDispatch } from "../../../redux/store/hooks";
import { bindActionCreators } from "redux";
import { AutocompleteWithPagination } from "../../../components/AutoComplete";

function EditPlot({ row, openeditModal, handleCloseModal, editSubmit, tags }) {
  const [sitePage, setSitePage] = useState(0);
  const [siteNameInput, setSiteNameInput] = useState("");
  const [sitesLoading, setSitesLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { getSites } = bindActionCreators(siteActionCreators, dispatch);

  const [formData, setFormData] = useState(row);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    editSubmit(formData);
    handleCloseModal();
  };

  useEffect(() => {
    getSitesData();
  }, [sitePage, siteNameInput]);

  const getSitesData = async () => {
    const siteNameFilter = {
      columnField: "name_english",
      value: siteNameInput,
      operatorValue: "contains",
    };

    setSitesLoading(true);
    getSites(sitePage * 10, 10, [siteNameFilter]);
    setTimeout(async () => {
      setSitesLoading(false);
    }, 1000);
  };

  const categoriesList = ["Public", "Foundation"];
  const accessibilityList = [
    { value: "accessible", label: "Accessible" },
    { value: "inaccessible", label: "Inaccessible" },
    { value: "moderately_accessible", label: "Moderately Accessible" },
  ];

  let sitesList = [];
  let sitesMap = {};
  const siteData = useAppSelector((state) => state.sitesData);

  if (siteData) {
    sitesMap = { ...siteData.sites };
    if (!Object.hasOwn(sitesMap, formData.site_id)) {
      sitesMap[formData.site_id] = { id: formData.site_id, name_english: formData.site_name }
    }
    sitesList = Object.values(sitesMap);
    sitesList = sitesList.sort((a, b) => {
      return b.id - a.id;
    });
  }

  return (
    <Dialog open={openeditModal} onClose={() => handleCloseModal()}>
      <DialogTitle align="center">Edit Plot</DialogTitle>
      <form onSubmit={handleEditSubmit}>
        <DialogContent>
          <TextField
            required
            name="name"
            label="Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            required
            name="label"
            label="Plot Label"
            value={formData.label}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <Autocomplete
            fullWidth
            name="accessibility_status"
            disablePortal
            options={accessibilityList}
            getOptionLabel={(option) => option?.label || ''}
            value={accessibilityList.find((item) => item.value === formData.accessibility_status) ?? null}
            renderInput={(params) => (
              <TextField {...params} margin="dense" label="Plot Accessibility Status" />
            )}
            onChange={(event, value) => {
              if (accessibilityList.includes(value)) setFormData((prevState) => ({ ...prevState, accessibility_status: value.value }));
            }}
          />
          <AutocompleteWithPagination
            name="site"
            label="Select a Site"
            options={sitesList}
            getOptionLabel={(option) => option?.name_english || ''}
            isOptionEqualToValue={(option, value) => {
              return option.id === value.id;
            }}
            onChange={(event, newValue) => {
              if (newValue !== null) {
                setFormData((prevState) => {
                  return { ...prevState, ["site_id"]: newValue.id };
                });
              }
            }}
            onInputChange={(event) => {
              const { value } = event.target;
              setSitePage(0);
              setSiteNameInput(value);
              handleChange(event);
            }}
            setPage={setSitePage}
            fullWidth
            size="medium"
            loading={sitesLoading}
            value={(siteNameInput === '' && Object.hasOwn(sitesMap, formData.site_id)) ? sitesMap[formData.site_id] : null}
          />
          <Autocomplete
            fullWidth
            name="category"
            disablePortal
            options={categoriesList}
            value={formData.category}
            renderInput={(params) => (
              <TextField {...params} margin="dense" label="Category" required />
            )}
            onChange={(event, value) => {
              if (categoriesList.includes(value))
                setFormData((prevState) => ({ ...prevState, category: value }));
            }}
          />
          <TextField
            name="gat"
            label="Gat"
            value={formData.gat}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TagSelector
            tagsList={tags}
            value={formData.tags}
            handleChange={(tags) => setFormData({ ...formData, tags: tags })}
            margin="dense"
          />
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "15px",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => handleCloseModal()}
            color="error"
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit" color="success">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default EditPlot;
