import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import {
  GridFilterItem,
} from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EditSites from "./EditSites";
import SaveIcon from '@mui/icons-material/Save';
import { TableColumnsType } from "antd";
import { Site } from "../../../types/site";
import getColumnSearchProps from "../../../components/Filter";
import TableComponent from "../../../components/Table";
import { useAppDispatch, useAppSelector } from "../../../redux/store/hooks";
import * as siteActionCreators from "../../../redux/actions/siteActions";
import { bindActionCreators } from "@reduxjs/toolkit";
import { RootState } from "../../../redux/store/store";
import AddSite from "./AddSite";
import { ToastContainer, toast } from "react-toastify";
import { SiteMap } from "./components/SiteMap";
import { getFormattedDate } from "../../../helpers/utils";
import ApiClient from "../../../api/apiClient/apiClient";
import { LoadingButton } from "@mui/lab";


export const SitesComponent = () => {
  const dispatch = useAppDispatch();
  const { getSites, createSite, updateSite, deleteSite } = bindActionCreators(
    siteActionCreators,
    dispatch
  );

  const [open, setOpen] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedEditRow, setSelectedEditRow] = useState<any | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Record<string, GridFilterItem>>({});

  const handleSetFilters = (filters: Record<string, GridFilterItem>) => {
    setPage(0);
    setFilters(filters);
  };

  useEffect(() => {
    getSiteData();
  }, [pageSize, page, filters]);

  const getSiteData = async () => {
    let filtersData = Object.values(filters);
    getSites(page * pageSize, pageSize, filtersData);
  };

  let sitesList: Site[] = [];
  const sitesData = useAppSelector((state: RootState) => state.sitesData);
  if (sitesData) {
    sitesList = Object.values(sitesData.sites);
    sitesList = sitesList.sort((a, b) => b.id - a.id);
  }

  const getAllSitesData = async () => {
    let filtersData = Object.values(filters);
    getSites(0, sitesData.totalSites, filtersData);
  };

  const handleDeleteSites = (row: Site) => {
    setOpenDeleteModal(true);
    setSelectedItem(row);
  };

  const handleEditSubmit = (formData: Site, files: Blob[]) => {
    updateSite(formData, files);
    setSelectedEditRow(null);
  };

  const handleCreateSiteData = (formData: Site) => {
    createSite(formData);
  };

  const handleSyncNotionSites = async () => {
    setSyncInProgress(true);
    const apiClient = new ApiClient();
    try {
      await apiClient.syncSitesDataFromNotion();
      toast.success('Successfully synced sites data from notion!')
    } catch (error: any) {
      if (error?.response?.data?.error) toast.error(error?.response?.data?.error)
      else toast.error(`Failed to sync sites from notion!`)
    }
    setSyncInProgress(false);
    getSiteData();
  };

  const columns: TableColumnsType<Site> = [
    {
      dataIndex: "action",
      key: "action",
      title: "Actions",
      width: 180,
      align: "center",
      render: (value, record, index) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            variant="outlined"
            style={{ margin: "0 5px" }}
            onClick={() => {
              setEditModal(true);
              setSelectedEditRow(record);
              console.log("Row data to edit : ", record);
            }}
          >
            <EditIcon />
          </Button>
          <Button
            variant="outlined"
            color="error"
            style={{ margin: "0 5px" }}
            onClick={() => handleDeleteSites(record)}
          >
            <DeleteIcon />
          </Button>
        </div>
      ),
    },
    {
      dataIndex: "name_marathi",
      key: "name_marathi",
      title: "Name (Marathi)",
      width: 220,
      align: "center",
      ...getColumnSearchProps("name_marathi", filters, handleSetFilters),
    },
    {
      dataIndex: "name_english",
      key: "name_english",
      title: "Name (English)",
      width: 220,
      align: "center",
      ...getColumnSearchProps("name_english", filters, handleSetFilters),
    },
    {
      dataIndex: "owner",
      key: "owner",
      title: "Owner",
      width: 180,
      align: "center",
      ...getColumnSearchProps("owner", filters, handleSetFilters),
    },
    {
      dataIndex: "maintenance_type",
      key: "maintenance_type",
      title: "Service Type",
      width: 180,
      align: "center",
      ...getColumnSearchProps("maintenance_type", filters, handleSetFilters),

    },
    {
      dataIndex: "land_type",
      key: "land_type",
      title: "Land Type",
      width: 150,
      align: "center",
      ...getColumnSearchProps("land_type", filters, handleSetFilters),
    },
    {
      dataIndex: "land_strata",
      key: "land_strata",
      title: "Land Strata",
      width: 150,
      align: "center",
      ...getColumnSearchProps("land_strata", filters, handleSetFilters),
    },
    {
      dataIndex: "district",
      key: "district",
      title: "District",
      width: 150,
      align: "center",
      ...getColumnSearchProps("district", filters, handleSetFilters),
    },
    {
      dataIndex: "taluka",
      key: "taluka",
      title: "Taluka",
      width: 150,
      align: "center",
      ...getColumnSearchProps("taluka", filters, handleSetFilters),
    },
    {
      dataIndex: "village",
      key: "village",
      title: "Village",
      width: 150,
      align: "center",
      ...getColumnSearchProps("village", filters, handleSetFilters),
    },
    {
      dataIndex: "area_acres",
      key: "area_acres",
      title: "Area (Acres)",
      width: 150,
      align: "center",
    },
    {
      dataIndex: "length_km",
      key: "length_km",
      title: "Length (Km)",
      width: 150,
      align: "center",
    },
    {
      dataIndex: "tags",
      key: "tags",
      title: "Tags",
      width: 150,
      align: "center",
    },
    {
      dataIndex: "photo_album",
      key: "photo_album",
      title: "Photo Album",
      width: 200,
      align: "center",
      render: (value: any) => (
        <a href={value} target="_blank" rel="noopener noreferrer">
          View Photos
        </a>
      ),
    },
    {
      dataIndex: "consent_letter",
      key: "consent_letter",
      title: "Consent Letter",
      width: 200,
      align: "center",
      ...getColumnSearchProps("consent_letter", filters, handleSetFilters),
    },
    {
      dataIndex: "grove_type",
      key: "grove_type",
      title: "Grove Type",
      width: 180,
      align: "center",
    },
    {
      dataIndex: "consent_document_link",
      key: "consent_document_link",
      title: "Consent Document Link",
      width: 200,
      align: "center",
      ...getColumnSearchProps("consent_document_link", filters, handleSetFilters),
    },
    {
      dataIndex: "google_earth_link",
      key: "google_earth_link",
      title: "Google Earth Link",
      width: 200,
      align: "center",
      ...getColumnSearchProps("google_earth_link", filters, handleSetFilters),
    },
    {
      dataIndex: "account",
      key: "account",
      title: "Account",
      width: 200,
      align: "center",
      ...getColumnSearchProps("account", filters, handleSetFilters),
    },
    {
      dataIndex: "site_data_check",
      key: "site_data_check",
      title: "Site Data Check",
      width: 200,
      align: "center",
      ...getColumnSearchProps("site_data_check", filters, handleSetFilters),
    },
    {
      dataIndex: "updated_at",
      key: "updated_at",
      title: "Updated At",
      width: 200,
      align: "center",
      render: getFormattedDate
    },
  ];

  return (
    <>
      <ToastContainer />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "4px 12px",
        }}
      >
        <Typography variant="h4" style={{ marginTop: '5px' }}>Sites</Typography>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "5px",
            marginTop: "5px",
          }}>
          <LoadingButton
            loading={syncInProgress}
            loadingPosition="start"
            variant="contained"
            color="success"
            onClick={handleSyncNotionSites}
            startIcon={<SaveIcon />}
            style={{ marginRight: "10px" }}
          >
            Sync Notion Sites
          </LoadingButton>
          <Button variant="contained" color="success" onClick={handleModalOpen}>
            Add Site
          </Button>
          <AddSite
            open={open}
            handleClose={handleModalClose}
            createSite={handleCreateSiteData}
          />
        </div>
      </div>
      <Divider sx={{ backgroundColor: "black", marginBottom: '15px' }} />
      <Box sx={{ height: 840, width: "100%" }}>
        <TableComponent
          dataSource={sitesList}
          columns={columns}
          totalRecords={sitesData.totalSites}
          fetchAllData={getAllSitesData}
          setPage={setPage}
          setPageSize={setPageSize}
          isExpandable={true}
          expandableFunction={(record) => <SiteMap KmlSource={record.google_earth_link[0]} />}
        />
        <SiteMap />
      </Box>



      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to delete '{selectedItem?.name_english}'?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedItem !== null) {
                deleteSite(selectedItem);
              }
              setOpenDeleteModal(false);
            }}
            color="primary"
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {selectedEditRow && (
        <EditSites
          row={selectedEditRow}
          openeditModal={editModal}
          closeEditModal={() => {
            setEditModal(false);
            setSelectedEditRow(null);
          }}
          editSubmit={handleEditSubmit}
        />
      )}
    </>
  );
};
