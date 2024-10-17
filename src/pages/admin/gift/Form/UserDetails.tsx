import { Box, Button, FormControlLabel, Grid, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import { FC, useEffect, useRef, useState } from "react";
import Papa from 'papaparse';
import { Table } from "antd";
import { ColumnType } from "antd/es/table";
import DeleteIcon from "@mui/icons-material/Delete";
import { UserForm } from "../../donation/components/UserForm";
import { toast } from "react-toastify";
import UserImagesForm from "./UserImagesForm";
import { AWSUtils } from "../../../../helpers/aws";
import ApiClient from "../../../../api/apiClient/apiClient";
import ImageMapping from "./ImageMapping";
import { ImageOutlined } from "@mui/icons-material";

interface User {
  name: string;
  phone: string;
  email: string;
  birth_date?: string;
  image?: boolean;
  image_name?: string;
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
    image_name: "John_Doe.png"
  },
  {
    name: "Sam Smith",
    phone: "1234567890",
    email: "jI5w3@example.com",
    birth_date: "01/01/2000",
    image: true,
    image_name: "Sam_Smith.png"
  },
  {
    name: "Rita White",
    phone: "1234567890",
    email: "jI5x2@example.com",
    birth_date: "01/01/2000",
  },
]

export const BulkUserForm: FC<BulkUserFormProps> = ({ requestId, users, onUsersChange, onFileChange }) => {
  const [pageUrl, setPageUrl] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userAddOption, setUserAddOption] = useState<'bulk' | 'single'>('bulk');
  const [openImageSelection, setOpenImageSelection] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

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
        console.log(user.name, uris)
        if (uris.length === 1) {
          isNew = true;
          user.image = true;
          user.image_name = uris[0].split('/').slice(-1)[0];
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

              if (user['Name'] && user['Email ID']) {
                parsedUsers.push({
                  name: user['Name'],
                  phone: user['Phone'],
                  email: user['Email ID'],
                  birth_date: user['Date of Birth (optional)'],
                  image_name: user['Image Name'],
                  image: user['Image Name'] !== ''
                    ? await awsUtils.checkIfPublicFileExists('gift-card-requests' + "/" + requestId + '/' + user['Image Name'])
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
      onUsersChange(newUsers);
    }
  }

  const handleUserAdd = (user: User) => {
    const idx = users.findIndex((u) => u.email === user.email);
    if (idx === -1) {
      onUsersChange([...users, user]);
    } else {
      toast.warning("User with same email already exists");
    }
  }

  const columns: ColumnType<User>[] = [
    {
      dataIndex: "name",
      key: "name",
      title: "Name",
      width: 180,
      align: "center",
    },
    {
      dataIndex: "email",
      key: "email",
      title: "Email",
      width: 180,
      align: "center",
    },
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
          : record.image_name + '\n(Not Found)'
    },
    {
      dataIndex: "error",
      key: "error",
      title: "Error",
      width: 180,
      align: "center",
      render: (value) => value ? 'Yes' : 'No',
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
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: '20px' }}>
      <Grid container rowSpacing={2} columnSpacing={1}>
        {/* <Grid item xs={12}>
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
        </Grid> */}
        <Grid item xs={12}>
          {userAddOption === 'single' && (
            <UserForm onSubmit={(user) => { handleUserAdd(user) }} />
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
              <Typography>Download sample file from <a href="https://docs.google.com/spreadsheets/d/1DDM5nyrvP9YZ09B60cwWICa_AvbgThUx-yeDVzT4Kw4/gviz/tq?tqx=out:csv&sheet=Sheet1">here</a> and fill the details.</Typography>
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
      >
        <Table
          columns={columns}
          dataSource={users.length > 0 ? users.sort((a, b) => {
            if (a.image === false) return 1;
            if (b.image === false) return -1;

            return 0;
          }) : dummyData}
          pagination={{ pageSize: 5 }}
        />
      </Grid>

      <ImageMapping name={setSelectedUser.name} open={openImageSelection} images={imageUrls} onClose={() => { setOpenImageSelection(false) }} onSelect={handleImageSelection} />
    </div>
  );
};
