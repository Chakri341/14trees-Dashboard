import ApiClient from "../../api/apiClient/apiClient";
import donationActionTypes from "../actionTypes/donationActionTypes";
import { Donation } from "../../types/donation";
import { PaginatedResponse } from "../../types/pagination";

export const getDonations = (offset: number, limit: number,filters?: any[]) => {
  const apiClient = new ApiClient()
  return (dispatch: any) => {
      dispatch({
          type: donationActionTypes.GET_DONATIONS_REQUESTED,
      });
      apiClient.getDonations(offset, limit ,filters).then(
          (value: PaginatedResponse<Donation>) => {
              console.log("Response in action: ", value)
              for (let i = 0; i < value.results.length; i++) {
                  if (value.results[i]?.id) {
                      value.results[i].key = value.results[i].id
                  }
              }
              dispatch({
                  type: donationActionTypes.GET_DONATIONS_SUCCEEDED,
                  payload: value,
              });
          },
          (error: any) => {
              console.log(error)
              dispatch({
                  type: donationActionTypes.GET_DONATIONS_FAILED,
                  payload: error
              });
          }
      )
  }
};


export const createDonation= (record: Donation) => {
  const apiClient = new ApiClient();
  return (dispatch: any) => {
      dispatch({
          type: donationActionTypes.CREATE_DONATION_REQUESTED,
      });
      apiClient.createDonation(record).then(
          (value: Donation) => {
              dispatch({
                  type: donationActionTypes.CREATE_DONATION_SUCCEEDED,
                  payload: value,
                 
              });
              console.log(value)
          },
          (error: any) => {
              console.error(error);
              dispatch({
                  type: donationActionTypes.CREATE_DONATION_FAILED,
              });
          }
      )
  };
};

export const updateDonation = (record: Donation) => {
  const apiClient = new ApiClient();
  return (dispatch: any) => {
      dispatch({
          type: donationActionTypes.UPDATE_DONATION_REQUESTED,
      });
      apiClient.updateDonation(record).then(
          (value: Donation) => {
              dispatch({
                  type: donationActionTypes.UPDATE_DONATION_SUCCEEDED,
                  payload: value,
              });
          },
          (error: any) => {
              dispatch({
                  type: donationActionTypes.UPDATE_DONATION_FAILED,
              });
          }
      )
  };
};


export const deleteDonation = (record: Donation) => {
  const apiClient = new ApiClient();
  return (dispatch: any) => {
      dispatch({
          type: donationActionTypes.DELETE_DONATION_REQUESTED,
      });
      apiClient.deleteDonation(record).then(
          (id: number) => {
              dispatch({
                  type: donationActionTypes.DELETE_DONATION_SUCCEEDED,
                  payload: id,
              });
          },
          (error: any) => {
              console.error(error);
              dispatch({
                  type: donationActionTypes.DELETE_DONATION_FAILED,
              });
          }
      )
  };
};