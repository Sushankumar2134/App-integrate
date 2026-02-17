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
        throw error;
    }
}

export async function createOrganization(organizationData:any) {
    try {
        const response = await apiclient.post(endpoint.organizations, organizationData);
        return response.data; // Assuming the API returns the created organization in the 'data' field
    } catch (error) {
        console.error("Error creating organization:", error);
        throw error;
    }
}

export async function fetchOrganizationById(id: string) {
    try {
        const response = await apiclient.get(`${endpoint.organizations}/${id}`);
        return response.data; // Assuming the API returns the organization in the 'data' field
    } catch (error) {
        console.error("Error fetching organization by ID:", error);
        throw error;
    }
}
export async function updateOrganization(id: string, organizationData: any) {
    try {
        const response = await apiclient.put(`${endpoint.organizations}/${id}`, organizationData);
        return response.data; // Assuming the API returns the updated organization in the 'data' field
    } catch (error) {
        console.error("Error updating organization:", error);
        throw error;
    }
}
export async function deleteOrganization(id: string) {
    try {
        const response = await apiclient.delete(`${endpoint.organizations}/${id}`);
        return response.data; // Assuming the API returns a success message or the deleted organization in the 'data' field
    } catch (error) {
        console.error("Error deleting organization:", error);
        throw error;
    }
}


