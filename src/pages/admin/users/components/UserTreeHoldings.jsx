import { useRecoilValue } from "recoil";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import { userTreeHoldings } from "../../../../store/adminAtoms";
import { Box } from "@mui/material";

const columns = [
  {
    field: "name",
    headerName: "Name",
    width: 250,
    valueGetter: (params) => params.row.user.name,
  },
  {
    field: "email",
    headerName: "Email",
    width: 250,
    editable: false,
    valueGetter: (params) => params.row.user.email,
  },
  {
    field: "count",
    headerName: "Tree Count",
    width: 250,
    editable: false,
    valueGetter: (params) => params.row.count,
  },
];

const handleClick = (e) => {
    if(e.field === "email") {
        window.open("https://dashboard.14trees.org/ww/"+e.formattedValue);
    }
}

export const UserTreeHoldings = () => {
  const treeHoldings = useRecoilValue(userTreeHoldings);
  console.log(treeHoldings);
  return (
    <div style={{ height: "700px", maxHeight: "900px", width: "100%" }}>
      <Box
        sx={{
          background: "linear-gradient(145deg, #9faca3, #bdccc2)",
          p: 2,
          borderRadius: 3,
          boxShadow: "8px 8px 16px #9eaaa1,-8px -8px 16px #c4d4c9",
          height: "100%",
          "& .MuiButton-root": {
            color: "#1f3625",
            pr: 2,
          },
          "& .MuiDataGrid-toolbarContainer": {
            p: 2,
          },
          "& .MuiDataGrid-root": {
            height: "94%",
          },
        }}
      >
        <DataGrid
          components={{ Toolbar: GridToolbar }}
          getRowId={(row) => row.user.name}
          rows={treeHoldings}
          columns={columns}
          pageSize={50}
          rowsPerPageOptions={[50]}
          onCellClick={(e) => handleClick(e)}
        />
      </Box>
    </div>
  );
};
