import { Box, Button, FormControlLabel, Grid, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import { FC, useEffect, useRef, useState } from "react";
import Papa from 'papaparse';
import { ColumnType } from "antd/es/table";
import { toast } from "react-toastify";
import UserImagesForm from "./UserImagesForm";
import { AWSUtils } from "../../../../helpers/aws";
import ApiClient from "../../../../api/apiClient/apiClient";
import ImageMapping from "./ImageMapping";
import { DeleteOutline, EditOutlined, ImageOutlined } from "@mui/icons-material";
import GeneralTable from "../../../../components/GenTable";
import getColumnSearchProps, { getColumnSelectedItemFilter } from "../../../../components/Filter";
import { GridFilterItem } from "@mui/x-data-grid";
import SingleUserForm from "./SingleUserForm";

interface User {
  name: string;
  phone: string;
  email: string;
  birth_date?: string;
  image?: boolean;
  image_name?: string;
  image_url?: string;
  in_name_of?: string;
  relation?: string;
  count: number;
  error?: boolean;
}

interface BulkUserFormProps {
  requestId: string | null;
  users: User[];
  onUsersChange: (users: User[]) => void;
  onFileChange: (file: File | null) => void;
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string) => {
  if (!phone || phone.trim() === '') return true;

  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // International phone number validation
  return phoneRegex.test(phone);
};

const dummyData: User[] = [
  {
    name: "John Doe",
    phone: "1234567890",
    email: "kN3qK@example.com",
    birth_date: "01/01/2000",
    image: false,
    image_name: "John_Doe.png",
    count: 1,
  },
  {
    name: "Sam Smith",
    phone: "1234567890",
    email: "jI5w3@example.com",
    birth_date: "01/01/2000",
    image: true,
    image_name: "Sam_Smith.png",
    count: 2,
  },
  {
    name: "Rita White",
    phone: "1234567890",
    email: "jI5x2@example.com",
    birth_date: "01/01/2000",
    count: 2
  },
]

const nameField = 'Name'
const emailField = 'Email'
const countField = 'Number of Trees'
const phoneField = 'Phone (optional)'
const imageNameField = 'Image Name (optional)'
const dobField = 'Date of Birth (optional)'

export const BulkUserForm: FC<BulkUserFormProps> = ({ requestId, users, onUsersChange, onFileChange }) => {
  const [pageUrl, setPageUrl] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userAddOption, setUserAddOption] = useState<'bulk' | 'single'>('bulk');
  const [openImageSelection, setOpenImageSelection] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5)
  const [filters, setFilters] = useState<Record<string, GridFilterItem>>({})
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

  const handleSetFilters = (filters: Record<string, GridFilterItem>) => {
    setPage(0);
    setFilters(filters)
  }

  const getFilteredUrls = (images: string[], str: string) => {

    const filteredUrls: string[] = [];
    for (const image of images) {
      const parts = str.split(' ')
      let count = 0;
      for (const part of parts) {
        if (image.toLocaleLowerCase().includes(part.toLocaleLowerCase())) count++;
      }

      if (count / parts.length > 0.5) filteredUrls.push(image)
    }

    return filteredUrls;
  }

  useEffect(() => {
    const newUsers: User[] = []
    let isNew = false;
    for (const user of users) {
      if (!user.image && user.name) {
        const uris = getFilteredUrls(imageUrls, user.name);

        if (uris.length === 1) {
          isNew = true;
          user.image = true;
          user.image_name = uris[0].split('/').slice(-1)[0];
          user.error = !isValidEmail(user.email) || !isValidPhone(user.phone)
        }
      }

      newUsers.push(user);
    }

    if (isNew) onUsersChange(newUsers);

  }, [imageUrls, users])

  useEffect(() => {
    const getUrls = async () => {

      if (!requestId) return;

      const apiClient = new ApiClient();
      const urls = await apiClient.getImagesForRequestId(requestId);
      setImageUrls(urls);
    }

    getUrls();
  }, [requestId])

  useEffect(() => {
    const filterList = Object.values(filters);
    let filteredUsers = users;
    for (const filter of filterList) {
      if ((filter.columnField === 'name') && filter.value) filteredUsers = filteredUsers.filter(item => item.name.includes(filter.value));
      else if ((filter.columnField === 'email') && filter.value) filteredUsers = filteredUsers.filter(item => item.email.includes(filter.value));
      else if (filter.columnField === 'image' && filter.value && filter.value.length > 0) {
        filteredUsers = filteredUsers.filter(item => {
          if (item.image === undefined && filter.value.includes('Image Not Provided')) return true;
          else if (item.image === false && filter.value.includes('Image Not Found')) return true;
          return false
        });
      } else if (filter.columnField === 'error' && filter.value && filter.value.length > 0) {
        filteredUsers = filteredUsers.filter(item => filter.value.includes(item.error ? 'Yes' : 'No'));
      }
    }

    setFilteredUsers(filteredUsers);
  }, [filters, users])

  const handleFileChange = (e: any) => {

    const awsUtils = new AWSUtils();
    if (e.target.files) {
      const file = e.target.files[0];
      onFileChange(file);
      if (file) {
        Papa.parse(file, {
          header: true,
          complete: async (results: any) => {
            const parsedUsers: User[] = [];

            for (let i = 0; i < results.data.length; i++) {
              const user = results.data[i];

              if (user[nameField] && user[emailField]) {
                parsedUsers.push({
                  name: (user[nameField] as string).trim(),
                  phone: (user[phoneField] as string).trim(),
                  email: (user[emailField] as string).trim(),
                  birth_date: user[dobField],
                  image_name: user[imageNameField] ? user[imageNameField] : undefined,
                  in_name_of: user['Plant in name of'] ? user['Plant in name of'] : undefined,
                  relation: user['Relation with person'] ? user['Relation with person'] : undefined,
                  count: user[countField] ? user[countField] : 1,
                  image: user[imageNameField] !== ''
                    ? await awsUtils.checkIfPublicFileExists('gift-card-requests' + "/" + requestId + '/' + user[imageNameField])
                    : undefined,
                  error: false,
                });
              }
            }

            const usersList = parsedUsers.map(user => {
              return {
                ...user,
                error: !isValidEmail(user.email) || !isValidPhone(user.phone) || user.image === false
              }
            });
            onUsersChange(usersList);
          },
          error: () => {
            setFileError("Failed to parse CSV file. Please ensure it is formatted correctly.");
          },
        });
      }
    }
  };

  const handleCrapWebPage = async () => {
    if (pageUrl === '' || !requestId) {
      toast.error('Please provide valid web page link');
      return;
    }

    const apiClient = new ApiClient();
    const imageUrls = await apiClient.scrapImagesFromWebPage(requestId, pageUrl);
    setImageUrls(imageUrls);

    toast.success("Successfully uploaded images!")
  }

  const handleImageSelection = (imageUrl: string) => {
    if (!selectedUser) return;

    const newUsers = [...users];
    const idx = newUsers.findIndex(user => user.email === selectedUser.email && user.name === selectedUser.name)
    if (idx > -1) {
      newUsers[idx].image = true;
      newUsers[idx].image_name = imageUrl.split('/').slice(-1)[0];
      newUsers[idx].error = !isValidEmail(newUsers[idx].email) || !isValidPhone(newUsers[idx].phone)
      onUsersChange(newUsers);
    }
  }

  const handleUserAdd = async (user: User) => {

    user.error = !isValidEmail(user.email) || !isValidPhone(user.phone) || user.name.trim() === ''
    if (user.error) {
      toast.error("Invalid user email, phone or user name is not provided!")
      return;
    }

    const image: File | string | undefined = (user as any).profileImage
    if (image && typeof image !== 'string' && requestId) {
      const awsUtils = new AWSUtils();
      const location = await awsUtils.uploadFileToS3(requestId, image, (progress: number) => { });
      user.image = true;
      user.image_name = image.name;
      user.image_url = location;
    } else {
      user.image = image ? selectedUser?.image : undefined;
      user.image_name = image ? selectedUser?.image_name : undefined;
      user.image_url = image ? selectedUser?.image_url : undefined;
    }

    user.name = user.name.trim();
    user.phone = user.phone.trim();
    user.email = user.email.trim();

    const idx = users.findIndex((u) => u.email === user.email);
    if (idx === -1) {
      onUsersChange([...users, user]);
    } else {
      const newUsers = [...users]
      newUsers[idx] = user;
      onUsersChange(newUsers);
    }

    setSelectedUser(null);
  }

  const handleDeleteUser = (user: User) => {
    onUsersChange(users.filter(item => item.email !== user.email));
  }

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPage(page - 1);
    setPageSize(pageSize);
  }

  const downloadGoogleSheet = () => {
    const url = "https://docs.google.com/spreadsheets/d/1DDM5nyrvP9YZ09B60cwWICa_AvbgThUx-yeDVzT4Kw4/gviz/tq?tqx=out:csv&sheet=Sheet1";
    const fileName = "UserDetails.csv";  // Set your desired file name here

    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => console.error("Download failed:", error));
  }

  const columns: ColumnType<User>[] = [
    {
      dataIndex: "name",
      key: "name",
      title: "Name",
      width: 180,
      align: "center",
      ...getColumnSearchProps('name', filters, handleSetFilters),
    },
    {
      dataIndex: "email",
      key: "email",
      title: "Email",
      width: 180,
      align: "center",
      ...getColumnSearchProps('email', filters, handleSetFilters),
    },
    {
      dataIndex: "count",
      key: "count",
      title: "Number of Trees",
      width: 180,
      align: "center",
    },
    // {
    //   dataIndex: "in_name_of",
    //   key: "in_name_of",
    //   title: "Plant in name Of",
    //   width: 180,
    //   align: "center",
    // },
    // {
    //   dataIndex: "relation",
    //   key: "relation",
    //   title: "Relation with person",
    //   width: 180,
    //   align: "center",
    // },
    {
      dataIndex: "phone",
      key: "phone",
      title: "Phone",
      width: 180,
      align: "center",
    },
    {
      dataIndex: "image",
      key: "image",
      title: "Image",
      width: 180,
      align: "center",
      render: (value, record) => value === undefined
        ? 'Image Not Provided'
        : value
          ? record.image_name
          : record.image_name + '\n(Not Found)',
      ...getColumnSelectedItemFilter({ dataIndex: 'image', filters, handleSetFilters, options: ['Image Not Provided', 'Image Not Found'] })
    },
    {
      dataIndex: "error",
      key: "error",
      title: "Error",
      width: 180,
      align: "center",
      render: (value) => value ? 'Yes' : 'No',
      ...getColumnSelectedItemFilter({ dataIndex: 'error', filters, handleSetFilters, options: ['Yes', 'No'] })
    },
    {
      dataIndex: "action",
      key: "action",
      title: "Actions",
      width: 150,
      align: "center",
      render: (value, record, index) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <Button
            variant="outlined"
            color="success"
            style={{ margin: "0 5px" }}
            onClick={() => {
              setSelectedUser(record);
              setOpenImageSelection(true);
            }}
          >
            <ImageOutlined />
          </Button>
          <Button
            variant="outlined"
            style={{ margin: "0 5px" }}
            onClick={() => {
              setSelectedUser(record);
            }}
          >
            <EditOutlined />
          </Button>
          <Button
            variant="outlined"
            color="error"
            style={{ margin: "0 5px" }}
            onClick={() => {
              handleDeleteUser(record);
            }}
          >
            <DeleteOutline />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: '20px', width: '100%' }}>
      <Grid container rowSpacing={2} columnSpacing={1}>
        <Grid item xs={12}>
          <RadioGroup
            row
            aria-label="enable"
            name="enable"
            value={userAddOption}
            onChange={(e) => { setUserAddOption(e.target.value as 'single' | 'bulk') }}
          >
            <FormControlLabel
              value="single"
              control={<Radio />}
              label="Manually"
            />
            <FormControlLabel
              value="bulk"
              control={<Radio />}
              label="CSV Upload"
            />
          </RadioGroup>
        </Grid>
        <Grid item xs={12}>
          {userAddOption === 'single' && (
            <SingleUserForm value={selectedUser} onSubmit={(user) => { handleUserAdd(user) }} onCancel={() => { setSelectedUser(null) }} />
          )}

          {userAddOption === 'bulk' && (
            <Grid item xs={12}>
              <Typography variant="body1">Enter the link of the web page containing user images (Optional).</Typography>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30, marginTop: 5 }}>
                <TextField
                  onChange={(event) => { setPageUrl(event.target.value) }}
                  margin="normal"
                  size="small"
                  label="Web page url (Optional)"
                  style={{ display: 'flex', flexGrow: 1, marginRight: 5, marginTop: 0, marginBottom: 0 }}
                />
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleCrapWebPage}
                >Upload Images</Button>
              </Box>
              <UserImagesForm requestId={requestId} />
              <Typography variant='body1' marginBottom={1} marginTop={2}>Upload the CSV file containing user details of the users who will be receiving the gift. If you have uploaded user images, make sure to mention exact name of the image in <strong>Image Name</strong> column.</Typography>
              <Typography>Download sample file from <a style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }} onClick={downloadGoogleSheet}>here</a> and fill the details.</Typography>
              <TextField
                type="file"
                inputProps={{ accept: '.csv' }}
                onChange={handleFileChange}
                fullWidth
                margin="normal"
                error={!!fileError}
                helperText={fileError}
                inputRef={fileInputRef}
              />
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
        style={{ marginLeft: '20px' }}
        maxWidth={'60%'}
      >
        <GeneralTable
          columns={columns}
          page={page}
          pageSize={pageSize}
          onPaginationChange={handlePaginationChange}
          totalRecords={filteredUsers.length}
          rows={users.length > 0 ? filteredUsers.sort((a, b) => {
            if (a.error) return -1;
            if (b.error) return 1;

            return 0;
          }).slice(page * pageSize, page * pageSize + pageSize) : dummyData}
          onDownload={async () => filteredUsers}
          rowClassName={(record, index) => record.error ? 'pending-item' : ''}
        />
      </Grid>

      <ImageMapping name={setSelectedUser.name} open={openImageSelection} images={imageUrls} onClose={() => { setOpenImageSelection(false) }} onSelect={handleImageSelection} />
    </div>
  );
};
