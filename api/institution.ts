import axios from "axios";
import baseURL,{endpoint} from "./apiclient";   


const apiclient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export async function fetchInstitutions() {
    try {
        const response = await apiclient.get(endpoint.institutions);
        return response.data; // Assuming the API returns data in the 'data' field
    } catch (error) {
        console.error("Error fetching institutions:", error);
        throw error;
    }
}
//@ts-ignore
export async function createInstitution(institutionData) {
    try {
        const response = await apiclient.post(endpoint.institutions, institutionData);
        return response.data; // Assuming the API returns the created institution in the 'data' field
    } catch (error) {
        console.error("Error creating institution:", error);
        throw error;
    }
}

export async function updateInstitution(id: string, institutionData: any) {
    try {
        const response = await apiclient.put(`${endpoint.institutions}/${id}`, institutionData);
        return response.data; // Assuming the API returns the updated institution in the 'data' field
    } catch (error) {
        console.error("Error updating institution:", error);
        throw error;
    }
}

export async function deleteInstitution(id: string) {
    try {
        const response = await apiclient.delete(`${endpoint.institutions}/${id}`);
        return response.data; // Assuming the API returns a success message or the deleted institution in the 'data' field
    } catch (error) {
        console.error("Error deleting institution:", error);
        throw error;
    }
}

export async function fetchInstitutionById(id: string) {
    try {
        const response = await apiclient.get(`${endpoint.institutions}/${id}`);
        return response.data; // Assuming the API returns the institution in the 'data' field
    } catch (error) {
        console.error("Error fetching institution by ID:", error);
        throw error;
    }
}






