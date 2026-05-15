import axios from "axios";
import baseURL,{endpoint} from "./apiclient";   


const apiclient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export async function fetchOrganizations() {
    try {
        const response = await apiclient.get(endpoint.organizations);
        return response.data; // Assuming the API returns data in the 'data' field
    } catch (error) {
        console.error("Error fetching organizations:", error);
        return null;
    }
}

export async function createOrganization(organizationData:any) {
    try {
        const response = await apiclient.post(endpoint.organizations, organizationData);
        return response.data; // Assuming the API returns the created organization in the 'data' field
    } catch (error) {
        console.error("Error creating organization:", error);
        return null;
    }
}

export async function fetchOrganizationById(id: string) {
    try {
        const response = await apiclient.get(`${endpoint.organizations}/${id}`);
        return response.data; // Assuming the API returns the organization in the 'data' field
    } catch (error) {
        console.error("Error fetching organization by ID:", error);
        return null;
    }
}
export async function updateOrganization(id: string, organizationData: any) {
    try {
        const response = await apiclient.put(`${endpoint.organizations}/${id}`, organizationData);
        return response.data; // Assuming the API returns the updated organization in the 'data' field
    } catch (error) {
        console.log(
  "Validation Error:",
  JSON.stringify((error as any)?.response?.data, null, 2)
);
        return null;
    }
}
export async function deleteOrganization(id: string) {
    try {
        const response = await apiclient.delete(`${endpoint.organizations}/${id}`);
        return response.data; // Assuming the API returns a success message or the deleted organization in the 'data' field
    } catch (error) {
        console.error("Error deleting organization:", error);
        return null;
    }
}
export async function toggleOrganizationStatus(id: string) {
  return apiclient.put(`${endpoint.organizations}/${id}/toggle-status`);
}
export async function restoreOrganization(id: string) {
    try {
        const response = await apiclient.put(
            `${endpoint.organizations}/${id}/restore`
        );

        return response.data;
    } catch (error) {
        console.error("Error restoring organization:", error);
        return null;
    }
}

