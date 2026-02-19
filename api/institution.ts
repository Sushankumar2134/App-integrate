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

export async function restoreInstitution(id: string) {
    try {
        // Try multiple endpoint patterns for restore
        const endpoints = [
            // Pattern 1: POST to /restore
            async () => apiclient.post(`${endpoint.institutions}/${id}/restore`),
            // Pattern 2: PUT with is_deleted: false
            async () => apiclient.put(`${endpoint.institutions}/${id}`, { is_deleted: false, deleted_at: null }),
            // Pattern 3: PATCH with is_deleted
            async () => apiclient.patch(`${endpoint.institutions}/${id}`, { is_deleted: false }),
            // Pattern 4: PUT with status and is_deleted
            async () => apiclient.put(`${endpoint.institutions}/${id}`, { status: 1, is_deleted: false }),
        ];

        let lastError: any = null;
        for (const endpoint of endpoints) {
            try {
                const response = await endpoint();
                return response.data;
            } catch (error: any) {
                lastError = error;
                continue; // Try next pattern
            }
        }

        // If all patterns fail, throw the last error
        throw lastError || new Error('All restore attempts failed');
    } catch (error) {
        console.error("Error restoring institution:", error);
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
// Toggle Institution Status
export async function toggleInstitutionStatus(id: string) {
    try {
        const response = await apiclient.post(
            `${endpoint.institutions}/${id}/toggle-status`
        );

        return response.data;
    } catch (error) {
        console.error("Error toggling institution status:", error);
        throw error;
    }
}
